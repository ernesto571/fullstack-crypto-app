import Transaction from "../models/portfolio.model.js";
import axios from "axios";

// --- In-memory cache for prices ---
const priceCache = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 60 * 5000; // 5 minute

// --- Retry helper for API calls ---
const safeFetch = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    const response = await axios.get(url, {
      ...options,
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CryptoPortfolioApp/1.0)',
        ...options.headers
      }
    });
    return response;
  } catch (error) {
    console.error(`API call failed (${retries} retries left):`, error.message);
    
    if (retries > 0 && (error.response?.status === 429 || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
      console.warn(`Retrying in ${delay}ms...`);
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
    const response = await safeFetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
    );
    
    priceCache.data = response.data;
    priceCache.timestamp = now;
    console.log('Price cache updated successfully');
    return response.data;
  } catch (error) {
    console.error("Price fetch error:", error.message);
    // Return stale cache or empty object as fallback
    if (priceCache.data) {
      console.warn('Using stale price cache due to API error');
      return priceCache.data;
    }
    return {};
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

    // Get all transactions for the user
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

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
        holdingsMap[coinId].totalQuantity -= parseFloat(quantity);
        holdingsMap[coinId].totalCostBasis -= parseFloat(totalAmount);
      }

      holdingsMap[coinId].transactions.push(transaction);
    });

    // Filter out holdings with zero or negative quantities
    const activeHoldings = Object.values(holdingsMap).filter((holding) => holding.totalQuantity > 0);

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
    const priceResponse = await getCachedPrices(coinIds);

    // Calculate portfolio summary
    let totalValue = 0;
    let totalCostBasis = 0;
    let totalDayChange = 0;

    const enrichedHoldings = activeHoldings.map((holding) => {
      const priceData = priceResponse[holding.coinId];
      const currentPrice = priceData?.usd || 0;
      const dayChangePercentage = priceData?.usd_24h_change || 0;

      const avgCost = holding.totalCostBasis / holding.totalQuantity;
      const currentValue = holding.totalQuantity * currentPrice;
      const pnl = currentValue - holding.totalCostBasis;
      const pnlPercentage = holding.totalCostBasis > 0 ? (pnl / holding.totalCostBasis) * 100 : 0;
      const dayChange = currentValue * (dayChangePercentage / 100);

      totalValue += currentValue;
      totalCostBasis += holding.totalCostBasis;
      totalDayChange += dayChange;

      return {
        ...holding,
        currentPrice: parseFloat(currentPrice) || 0,
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
        totalValue: parseFloat(totalValue) || 0,
        totalCostBasis: parseFloat(totalCostBasis) || 0,
        totalPnL: parseFloat(totalPnL) || 0,
        totalPnLPercentage: parseFloat(totalPnLPercentage) || 0,
        dayChange: parseFloat(totalDayChange) || 0,
        dayChangePercentage: parseFloat(totalDayChangePercentage) || 0,
      },
    };

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

    // Recalculate total amount if quantity or price changed
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