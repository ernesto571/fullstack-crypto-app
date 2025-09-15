import Transaction from "../models/portfolio.model.js";
import axios from "axios";

/**
 * ===============================================================
 * Safe Fetch Helper (backend version with retry + exponential backoff)
 * ===============================================================
 * - Wraps axios.get calls
 * - Handles CoinGecko's 429 (rate-limit) responses
 * - Retries with exponential backoff
 * - Prevents the app from instantly crashing on rate-limit errors
 */
// --- Simple in-memory cache for CoinGecko prices ---
const priceCache = new Map(); // { coinIds: { data, timestamp } }
const CACHE_TTL = 60 * 1000; // 60 seconds

// helper to get cached or fresh prices
const getCachedPrices = async (coinIds) => {
  const key = coinIds.split(",").sort().join(","); // stable key
  const cached = priceCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data; // return cached data
  }

  try {
    const response = await safeFetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = response?.data || {};
    priceCache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error("Price fetch failed:", err.message);
    return cached ? cached.data : {}; // fallback to last cache if available
  }
};

export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
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
          dayChangePercentage: 0
        }
      });
    }

    // --- Group by coinId ---
    const holdingsMap = {};
    transactions.forEach(tx => {
      const { coinId, type, quantity, totalAmount, coinName, coinSymbol, coinImage } = tx;

      if (!holdingsMap[coinId]) {
        holdingsMap[coinId] = {
          coinId,
          coinName,
          coinSymbol,
          coinImage,
          totalQuantity: 0,
          totalCostBasis: 0,
          transactions: []
        };
      }

      if (type === "buy") {
        holdingsMap[coinId].totalQuantity += quantity;
        holdingsMap[coinId].totalCostBasis += totalAmount;
      } else if (type === "sell") {
        holdingsMap[coinId].totalQuantity -= quantity;
        holdingsMap[coinId].totalCostBasis -= totalAmount;
      }

      holdingsMap[coinId].transactions.push(tx);
    });

    const activeHoldings = Object.values(holdingsMap).filter(h => h.totalQuantity > 0);

    if (activeHoldings.length === 0) {
      return res.json({
        holdings: [],
        summary: {
          totalValue: 0,
          totalCostBasis: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          dayChange: 0,
          dayChangePercentage: 0
        }
      });
    }

    // --- Cached + safe fetch prices ---
    const coinIds = activeHoldings.map(h => h.coinId).join(",");
    const prices = await getCachedPrices(coinIds);

    let totalValue = 0;
    let totalCostBasis = 0;
    let totalDayChange = 0;

    const enrichedHoldings = activeHoldings.map(holding => {
      const currentPrice = prices[holding.coinId]?.usd || 0;
      const dayChangePercentage = prices[holding.coinId]?.usd_24h_change || 0;

      const avgCost = holding.totalQuantity > 0
        ? holding.totalCostBasis / holding.totalQuantity
        : 0;

      const currentValue = holding.totalQuantity * currentPrice;
      const pnl = currentValue - holding.totalCostBasis;
      const pnlPercentage = holding.totalCostBasis > 0
        ? (pnl / holding.totalCostBasis) * 100
        : 0;

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
        dayChangePercentage
      };
    });

    const totalPnL = totalValue - totalCostBasis;
    const totalPnLPercentage = totalCostBasis > 0
      ? (totalPnL / totalCostBasis) * 100
      : 0;
    const totalDayChangePercentage = totalValue > 0
      ? (totalDayChange / totalValue) * 100
      : 0;

    res.json({
      holdings: enrichedHoldings,
      summary: {
        totalValue,
        totalCostBasis,
        totalPnL,
        totalPnLPercentage,
        dayChange: totalDayChange,
        dayChangePercentage: totalDayChangePercentage
      }
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * ===============================================================
 * GET TRANSACTIONS
 * ===============================================================
 * - Returns paginated transaction history
 * - Supports filtering by coinId
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, coinId } = req.query;

    // Build query
    const query = { userId };
    if (coinId) query.coinId = coinId;

    // Get paginated results
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Count total
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

/**
 * ===============================================================
 * UPDATE TRANSACTION
 * ===============================================================
 * - Updates a transaction
 * - Recalculates totalAmount if quantity/price changed
 */
export const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // If quantity or price changed → recalc totalAmount
    if (updateData.quantity || updateData.pricePerCoin) {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const quantity = updateData.quantity || transaction.quantity;
      const pricePerCoin = updateData.pricePerCoin || transaction.pricePerCoin;
      updateData.totalAmount = quantity * pricePerCoin;
    }

    // Update transaction
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

/**
 * ===============================================================
 * DELETE TRANSACTION
 * ===============================================================
 * - Removes a transaction
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};
