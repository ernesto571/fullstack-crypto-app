import Transaction from "../models/portfolio.model.js";
import axios from "axios";

// --- In-memory cache for prices ---
const priceCache = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// CoinGecko API configuration
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_BASE_URL = COINGECKO_API_KEY 
  ? 'https://pro-api.coingecko.com/api/v3' 
  : 'https://api.coingecko.com/api/v3';

// --- Retry helper for API calls ---
const safeFetch = async (url, options = {}, retries = 2, delay = 3000) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; CryptoPortfolioApp/1.0)',
      'Accept': 'application/json',
      ...options.headers
    };

    // Add API key if available
    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }

    console.log(`Making API request to: ${url}`);
    
    const response = await axios.get(url, {
      ...options,
      timeout: 20000, // 20 second timeout
      headers
    });
    
    console.log(`API request successful. Status: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`API call failed (${retries} retries left):`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: url
    });
    
    if (retries > 0) {
      if (error.response?.status === 429) {
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
      } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        console.warn(`Connection error. Retrying in ${delay}ms...`);
      } else if (error.response?.status >= 500) {
        console.warn(`Server error. Retrying in ${delay}ms...`);
      } else {
        // Don't retry for other errors (400, 404, etc.)
        throw error;
      }
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      return safeFetch(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

// --- Get cached or fresh prices ---
const getCachedPrices = async (coinIds) => {
  const now = Date.now();

  // Serve from cache if still fresh
  if (priceCache.data && now - priceCache.timestamp < CACHE_TTL) {
    console.log('Serving prices from cache');
    return priceCache.data;
  }

  try {
    console.log('Fetching fresh prices for:', coinIds);
    
    // Use the appropriate base URL based on API key availability
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await safeFetch(url);
    
    if (response.data && Object.keys(response.data).length > 0) {
      priceCache.data = response.data;
      priceCache.timestamp = now;
      console.log('Price cache updated successfully:', Object.keys(response.data));
      return response.data;
    } else {
      throw new Error('Empty price data received');
    }
  } catch (error) {
    console.error("Price fetch error:", {
      message: error.message,
      status: error.response?.status,
      coinIds: coinIds
    });
    
    // Return stale cache if available
    if (priceCache.data) {
      console.warn('Using stale price cache due to API error');
      return priceCache.data;
    }
    
    // Return mock data with reasonable fallback prices as last resort
    console.warn('No cached data available, using fallback prices');
    const fallbackPrices = {};
    const coinIdArray = coinIds.split(',');
    
    coinIdArray.forEach(coinId => {
      // Provide reasonable fallback prices for common coins
      let fallbackPrice = 1;
      if (coinId === 'bitcoin') fallbackPrice = 100000;
      else if (coinId === 'ethereum') fallbackPrice = 3500;
      else if (coinId === 'binancecoin') fallbackPrice = 600;
      else if (coinId === 'cardano') fallbackPrice = 0.5;
      else if (coinId === 'solana') fallbackPrice = 150;
      
      fallbackPrices[coinId] = {
        usd: fallbackPrice,
        usd_24h_change: 0
      };
    });
    
    return fallbackPrices;
  }
};

// Add a new transaction
export const addTransaction = async (req, res) => {
  try {
    const { coinId, coinName, coinSymbol, coinImage, type, quantity, pricePerCoin, date, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!coinId || !coinName || !type || !quantity || !pricePerCoin) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate total amount
    const totalAmount = parseFloat(quantity) * parseFloat(pricePerCoin);

    const transaction = new Transaction({
      userId,
      coinId,
      coinName,
      coinSymbol,
      coinImage,
      type,
      quantity: parseFloat(quantity),
      pricePerCoin: parseFloat(pricePerCoin),
      totalAmount,
      date: date ? new Date(date) : new Date(),
      notes,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's portfolio summary with live prices
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching portfolio for user: ${userId}`);

    // Get all transactions for the user
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    console.log(`Found ${transactions.length} transactions`);

    if (transactions.length === 0) {
      return res.json({
        holdings: [],
        summary: {
          totalValue: 0,
          totalCostBasis: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          dayChange: 0,
          dayChangePercentage: 0,
        },
      });
    }

    // Calculate holdings by grouping transactions by coinId
    const holdingsMap = {};

    transactions.forEach((transaction) => {
      const { coinId, type, quantity, totalAmount, coinName, coinSymbol, coinImage } = transaction;

      if (!holdingsMap[coinId]) {
        holdingsMap[coinId] = {
          coinId,
          coinName,
          coinSymbol,
          coinImage,
          totalQuantity: 0,
          totalCostBasis: 0,
          transactions: [],
        };
      }

      if (type === "buy") {
        holdingsMap[coinId].totalQuantity += parseFloat(quantity);
        holdingsMap[coinId].totalCostBasis += parseFloat(totalAmount);
      } else if (type === "sell") {
        const currentQuantity = holdingsMap[coinId].totalQuantity;
        const sellQuantity = parseFloat(quantity);
        
        // Calculate proportional cost basis reduction
        if (currentQuantity > 0) {
          const avgCostBasis = holdingsMap[coinId].totalCostBasis / currentQuantity;
          holdingsMap[coinId].totalCostBasis -= avgCostBasis * sellQuantity;
        }
        
        holdingsMap[coinId].totalQuantity -= sellQuantity;
      }

      holdingsMap[coinId].transactions.push(transaction);
    });

    // Filter out holdings with zero or negative quantities
    const activeHoldings = Object.values(holdingsMap).filter((holding) => holding.totalQuantity > 0);
    console.log(`Active holdings: ${activeHoldings.length}`);

    if (activeHoldings.length === 0) {
      return res.json({
        holdings: [],
        summary: {
          totalValue: 0,
          totalCostBasis: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          dayChange: 0,
          dayChangePercentage: 0,
        },
      });
    }

    // Get current prices (cached) from backend
    const coinIds = activeHoldings.map((h) => h.coinId).join(",");
    console.log(`Fetching prices for: ${coinIds}`);
    
    const priceResponse = await getCachedPrices(coinIds);
    console.log(`Price response keys:`, Object.keys(priceResponse));

    // Initialize totals
    let totalValue = 0;
    let totalCostBasis = 0;
    let totalDayChange = 0;

    const enrichedHoldings = activeHoldings.map((holding) => {
      const priceData = priceResponse[holding.coinId];
      
      if (!priceData) {
        console.warn(`No price data found for ${holding.coinId}`);
      }
      
      const currentPrice = parseFloat(priceData?.usd || 0);
      const dayChangePercentage = parseFloat(priceData?.usd_24h_change || 0);

      // Calculate values
      const avgCost = holding.totalCostBasis / holding.totalQuantity;
      const currentValue = holding.totalQuantity * currentPrice;
      const pnl = currentValue - holding.totalCostBasis;
      const pnlPercentage = holding.totalCostBasis > 0 ? (pnl / holding.totalCostBasis) * 100 : 0;
      const dayChange = currentValue * (dayChangePercentage / 100);

      // Add to totals
      totalValue += currentValue;
      totalCostBasis += holding.totalCostBasis;
      totalDayChange += dayChange;

      console.log(`${holding.coinName}: price=${currentPrice}, value=${currentValue}, pnl=${pnl}`);

      return {
        ...holding,
        currentPrice: currentPrice,
        avgCost: parseFloat(avgCost) || 0,
        currentValue: parseFloat(currentValue) || 0,
        pnl: parseFloat(pnl) || 0,
        pnlPercentage: parseFloat(pnlPercentage) || 0,
        dayChange: parseFloat(dayChange) || 0,
        dayChangePercentage: parseFloat(dayChangePercentage) || 0,
      };
    });

    // Calculate portfolio totals
    const totalPnL = totalValue - totalCostBasis;
    const totalPnLPercentage = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;
    const totalDayChangePercentage = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

    const portfolioData = {
      holdings: enrichedHoldings,
      summary: {
        totalValue: parseFloat(totalValue.toFixed(2)) || 0,
        totalCostBasis: parseFloat(totalCostBasis.toFixed(2)) || 0,
        totalPnL: parseFloat(totalPnL.toFixed(2)) || 0,
        totalPnLPercentage: parseFloat(totalPnLPercentage.toFixed(2)) || 0,
        dayChange: parseFloat(totalDayChange.toFixed(2)) || 0,
        dayChangePercentage: parseFloat(totalDayChangePercentage.toFixed(2)) || 0,
      },
    };

    console.log('Portfolio summary:', {
      totalValue: portfolioData.summary.totalValue,
      totalCostBasis: portfolioData.summary.totalCostBasis,
      totalPnL: portfolioData.summary.totalPnL,
      holdingsCount: enrichedHoldings.length
    });

    res.json(portfolioData);
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ error: "Failed to fetch portfolio data" });
  }
};

// Get current market prices - dedicated endpoint for frontend
export const getCurrentPrices = async (req, res) => {
  try {
    const { coinIds } = req.query;
    
    if (!coinIds) {
      return res.status(400).json({ error: "coinIds parameter is required" });
    }

    const priceData = await getCachedPrices(coinIds);
    res.json(priceData);
  } catch (error) {
    console.error("Get current prices error:", error);
    res.status(500).json({ error: "Failed to fetch current prices" });
  }
};

// Get all transactions
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, coinId } = req.query;

    const query = { userId };
    if (coinId) query.coinId = coinId;

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    if (updateData.quantity || updateData.pricePerCoin) {
      const transaction = await Transaction.findOne({ _id: transactionId, userId });
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const quantity = parseFloat(updateData.quantity || transaction.quantity);
      const pricePerCoin = parseFloat(updateData.pricePerCoin || transaction.pricePerCoin);
      updateData.totalAmount = quantity * pricePerCoin;
      updateData.quantity = quantity;
      updateData.pricePerCoin = pricePerCoin;
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId }, 
      updateData, 
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};