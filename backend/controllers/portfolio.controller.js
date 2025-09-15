import Transaction from "../models/portfolio.model.js";
import axios from "axios";

// --- In-memory cache for prices ---
const priceCache = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 60 * 1000; // 1 minute

// --- Retry helper for API calls ---
const safeFetch = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    return await axios.get(url, options);
  } catch (error) {
    if (retries > 0 && error.response?.status === 429) {
      console.warn(`429 Too Many Requests. Retrying in ${delay}ms...`);
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
    return priceCache.data;
  }

  try {
    const response = await safeFetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
    );
    priceCache.data = response.data;
    priceCache.timestamp = now;
    return response.data;
  } catch (error) {
    console.error("Price fetch error:", error.message);
    return priceCache.data || {}; // fallback to stale cache
  }
};

// Add a new transaction
export const addTransaction = async (req, res) => {
  try {
    const { coinId, coinName, coinSymbol, coinImage, type, quantity, pricePerCoin, date, notes } = req.body;
    const userId = req.user.id;

    // Calculate total amount
    const totalAmount = quantity * pricePerCoin;

    const transaction = new Transaction({
      userId,
      coinId,
      coinName,
      coinSymbol,
      coinImage,
      type,
      quantity,
      pricePerCoin,
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

// Get user's portfolio summary
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
        holdingsMap[coinId].totalQuantity += quantity;
        holdingsMap[coinId].totalCostBasis += totalAmount;
      } else if (type === "sell") {
        holdingsMap[coinId].totalQuantity -= quantity;
        holdingsMap[coinId].totalCostBasis -= totalAmount;
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

    // Get current prices (cached)
    const coinIds = activeHoldings.map((h) => h.coinId).join(",");
    const priceResponse = await getCachedPrices(coinIds);

    // Calculate portfolio summary
    let totalValue = 0;
    let totalCostBasis = 0;
    let totalDayChange = 0;

    const enrichedHoldings = activeHoldings.map((holding) => {
      const currentPrice = priceResponse[holding.coinId]?.usd;
      if (!currentPrice || currentPrice <= 0) return { ...holding, currentPrice: 0 };
      const dayChangePercentage = priceResponse[holding.coinId]?.usd_24h_change || 0;

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
        currentPrice,
        avgCost,
        currentValue,
        pnl,
        pnlPercentage,
        dayChange,
        dayChangePercentage,
      };
    });

    const totalPnL = totalValue - totalCostBasis;
    const totalPnLPercentage = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;
    const totalDayChangePercentage = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

    res.json({
      holdings: enrichedHoldings,
      summary: {
        totalValue,
        totalCostBasis,
        totalPnL,
        totalPnLPercentage,
        dayChange: totalDayChange,
        dayChangePercentage: totalDayChangePercentage,
      },
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ error: error.message });
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
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        currentPage: page,
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

      const quantity = updateData.quantity || transaction.quantity;
      const pricePerCoin = updateData.pricePerCoin || transaction.pricePerCoin;
      updateData.totalAmount = quantity * pricePerCoin;
    }

    const transaction = await Transaction.findOneAndUpdate({ _id: transactionId, userId }, updateData, { new: true });

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
