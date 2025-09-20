import Transaction from "../models/portfolio.model.js";
import axios from "axios";

// --- In-memory cache for prices ---
const priceCache = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Since you're not using pro, always use free API
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Function to validate coin IDs and remove problematic ones
const validateAndCleanCoinIds = (coinIds) => {
  const coinArray = coinIds.split(',');
  const validatedIds = [];
  
  // List of known problematic coin IDs for free tier
  const problematicIds = ['pepe']; // Add more if needed
  
  coinArray.forEach(coinId => {
    const trimmedId = coinId.trim().toLowerCase();
    
    if (problematicIds.includes(trimmedId)) {
      console.log(`Skipping problematic coin ID: ${trimmedId}`);
      return; // Skip this coin
    }
    
    validatedIds.push(trimmedId);
    console.log(`Including coin ID: ${trimmedId}`);
  });
  
  return validatedIds.join(',');
};

// --- Retry helper for API calls ---
const safeFetch = async (url, options = {}, retries = 2, delay = 3000) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; CryptoPortfolioApp/1.0)',
      'Accept': 'application/json',
      ...options.headers
    };

    // DON'T add any API key headers for free tier
    console.log('Using CoinGecko Free API (no key required)');
    console.log(`Making API request to: ${url}`);
    
    const response = await axios.get(url, {
      ...options,
      timeout: 15000,
      headers
    });
    
    console.log(`API request successful. Status: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`API call failed (${retries} retries left):`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: url,
      responseData: error.response?.data
    });
    
    // For 400 errors, try removing problematic coins
    if (error.response?.status === 400 && retries > 0) {
      console.error('400 Bad Request - trying without problematic coins');
      
      // Try with basic coins only
      if (url.includes('pepe') || url.includes(',')) {
        console.log('Retrying with basic coins only...');
        const basicUrl = url.replace(/ids=[^&]+/, 'ids=bitcoin,ethereum,dogecoin');
        
        if (basicUrl !== url) {
          return safeFetch(basicUrl, options, 0, delay); // No more retries
        }
      }
      
      throw error;
    }
    
    if (retries > 0 && error.response?.status === 429) {
      console.warn(`Rate limited. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return safeFetch(url, options, retries - 1, delay * 2);
    }
    
    throw error;
  }
};

// --- Get cached or fresh prices ---
const getCachedPrices = async (coinIds) => {
  const now = Date.now();

  if (priceCache.data && now - priceCache.timestamp < CACHE_TTL) {
    console.log('Serving prices from cache');
    return priceCache.data;
  }

  try {
    console.log('Original coin IDs:', coinIds);
    
    // Clean problematic coin IDs
    const cleanedCoinIds = validateAndCleanCoinIds(coinIds);
    console.log('Cleaned coin IDs:', cleanedCoinIds);
    
    if (!cleanedCoinIds) {
      throw new Error('No valid coin IDs after cleaning');
    }
    
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${cleanedCoinIds}&vs_currencies=usd&include_24hr_change=true`;
    console.log('Full API URL:', url);
    
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
    
    if (priceCache.data) {
      console.warn('Using stale price cache due to API error');
      return priceCache.data;
    }
    
    // Fallback prices for all requested coins
    console.warn('No cached data available, using fallback prices');
    const fallbackPrices = {};
    const coinIdArray = coinIds.split(',');
    
    coinIdArray.forEach(coinId => {
      let fallbackPrice = 1;
      const cleanId = coinId.trim().toLowerCase();
      
      if (cleanId === 'bitcoin') fallbackPrice = 100000;
      else if (cleanId === 'ethereum') fallbackPrice = 3500;
      else if (cleanId === 'binancecoin') fallbackPrice = 650;
      else if (cleanId === 'solana') fallbackPrice = 195;
      else if (cleanId === 'dogecoin') fallbackPrice = 0.12;
      else if (cleanId === 'pepe') fallbackPrice = 0.00001;
      else if (cleanId === 'cardano') fallbackPrice = 0.36;
      else if (cleanId === 'ripple') fallbackPrice = 0.58;
      
      fallbackPrices[cleanId] = {
        usd: fallbackPrice,
        usd_24h_change: 0
      };
    });
    
    console.log('Using fallback prices:', fallbackPrices);
    return fallbackPrices;
  }
};

// Test endpoint to verify API works
export const testCoinIds = async (req, res) => {
  try {
    // Test with known good IDs
    const testIds = 'bitcoin,ethereum,dogecoin';
    console.log('Testing coin IDs:', testIds);
    
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${testIds}&vs_currencies=usd`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; CryptoPortfolioApp/1.0)',
      'Accept': 'application/json'
    };

    const response = await axios.get(url, { headers, timeout: 15000 });
    
    res.json({
      success: true,
      url: url,
      usingFreeAPI: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      status: error.response?.status,
      url: error.config?.url,
      usingFreeAPI: true,
      responseData: error.response?.data
    });
  }
};

// Get user's portfolio summary
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching portfolio for user: ${userId}`);
    console.log(`Using Free API: ${COINGECKO_BASE_URL}`);

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

    // Calculate holdings
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
        
        if (currentQuantity > 0) {
          const avgCostBasis = holdingsMap[coinId].totalCostBasis / currentQuantity;
          holdingsMap[coinId].totalCostBasis -= avgCostBasis * sellQuantity;
        }
        
        holdingsMap[coinId].totalQuantity -= sellQuantity;
      }

      holdingsMap[coinId].transactions.push(transaction);
    });

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

    // Get current prices
    const coinIds = activeHoldings.map((h) => h.coinId).join(",");
    console.log(`Raw coin IDs from database: ${coinIds}`);
    
    const priceResponse = await getCachedPrices(coinIds);
    console.log(`Price response keys:`, Object.keys(priceResponse));

    // Calculate portfolio values
    let totalValue = 0;
    let totalCostBasis = 0;
    let totalDayChange = 0;

    const enrichedHoldings = activeHoldings.map((holding) => {
      // Try to find price data for this coin
      const priceData = priceResponse[holding.coinId] || 
                       priceResponse[holding.coinId.toLowerCase()] ||
                       null;
      
      if (!priceData) {
        console.warn(`No price data found for ${holding.coinId}. Available keys: ${Object.keys(priceResponse).join(', ')}`);
      }
      
      const currentPrice = parseFloat(priceData?.usd || 0);
      const dayChangePercentage = parseFloat(priceData?.usd_24h_change || 0);

      const avgCost = holding.totalCostBasis / holding.totalQuantity;
      const currentValue = holding.totalQuantity * currentPrice;
      const pnl = currentValue - holding.totalCostBasis;
      const pnlPercentage = holding.totalCostBasis > 0 ? (pnl / holding.totalCostBasis) * 100 : 0;
      const dayChange = currentValue * (dayChangePercentage / 100);

      totalValue += currentValue;
      totalCostBasis += holding.totalCostBasis;
      totalDayChange += dayChange;

      console.log(`${holding.coinName}: coinId=${holding.coinId}, price=${currentPrice}, quantity=${holding.totalQuantity}, value=${currentValue}, pnl=${pnl}`);

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

    console.log('Final portfolio summary:', portfolioData.summary);
    res.json(portfolioData);
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ error: "Failed to fetch portfolio data" });
  }
};

// Rest of the functions remain the same...
export const addTransaction = async (req, res) => {
  try {
    const { coinId, coinName, coinSymbol, coinImage, type, quantity, pricePerCoin, date, notes } = req.body;
    const userId = req.user.id;

    if (!coinId || !coinName || !type || !quantity || !pricePerCoin) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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