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
const safeFetch = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    // Attempt the request
    const response = await axios.get(url, options);
    return response;
  } catch (error) {
    // If it's a 429, retry with exponential backoff
    if (retries > 0 && error.response?.status === 429) {
      console.warn(`429 Too Many Requests. Retrying in ${delay}ms...`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry with fewer retries and increased delay
      return safeFetch(url, options, retries - 1, delay * 2);
    }

    // Re-throw if it's another error
    throw error;
  }
};

/**
 * ===============================================================
 * ADD TRANSACTION
 * ===============================================================
 * - Adds a new transaction to the portfolio
 * - Requires authentication (req.user.id)
 * - Calculates totalAmount = quantity * pricePerCoin
 */
export const addTransaction = async (req, res) => {
  try {
    const {
      coinId,
      coinName,
      coinSymbol,
      coinImage,
      type,
      quantity,
      pricePerCoin,
      date,
      notes,
    } = req.body;

    const userId = req.user.id;

    // Safety check: prevent invalid quantities or prices
    if (!coinId || !type || quantity <= 0 || pricePerCoin <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid transaction data provided." });
    }

    // Calculate total amount
    const totalAmount = quantity * pricePerCoin;

    // Create transaction document
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

    // Save to DB
    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ===============================================================
 * GET PORTFOLIO
 * ===============================================================
 * - Returns the user's portfolio summary and holdings
 * - Groups transactions by coinId
 * - Calls CoinGecko API (via safeFetch) for live prices
 * - Calculates:
 *    • totalValue
 *    • cost basis
 *    • PnL
 *    • daily change
 */




/**
 * GET PORTFOLIO
 */
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch transactions
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

    // Group by coin
    const holdingsMap = {};
    transactions.forEach((t) => {
      if (!holdingsMap[t.coinId]) {
        holdingsMap[t.coinId] = {
          coinId: t.coinId,
          coinName: t.coinName,
          coinSymbol: t.coinSymbol,
          coinImage: t.coinImage,
          totalQuantity: 0,
          totalCostBasis: 0,
          transactions: [],
        };
      }
      if (t.type === "buy") {
        holdingsMap[t.coinId].totalQuantity += t.quantity;
        holdingsMap[t.coinId].totalCostBasis += t.totalAmount;
      } else if (t.type === "sell") {
        holdingsMap[t.coinId].totalQuantity -= t.quantity;
        holdingsMap[t.coinId].totalCostBasis -= t.totalAmount;
      }
      holdingsMap[t.coinId].transactions.push(t);
    });

    const activeHoldings = Object.values(holdingsMap).filter(
      (h) => h.totalQuantity > 0
    );
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

    // Fetch prices
    const coinIds = encodeURIComponent(
      activeHoldings.map((h) => h.coinId).join(",")
    );

    let priceResponse;
    try {
      priceResponse = await safeFetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
      );
    } catch (err) {
      console.error("CoinGecko API failed in deployment:", err.message);
      // Fallback → still return portfolio with 0 prices
      priceResponse = { data: {} };
    }

    // Build holdings
    let totalValue = 0;
    let totalCostBasis = 0;
    let totalDayChange = 0;

    const enrichedHoldings = activeHoldings.map((h) => {
      const currentPrice = priceResponse.data[h.coinId]?.usd || 0;
      const dayChangePercentage =
        priceResponse.data[h.coinId]?.usd_24h_change || 0;

      const avgCost = h.totalCostBasis / h.totalQuantity;
      const currentValue = h.totalQuantity * currentPrice;
      const pnl = currentValue - h.totalCostBasis;
      const pnlPercentage =
        h.totalCostBasis > 0 ? (pnl / h.totalCostBasis) * 100 : 0;
      const dayChange = currentValue * (dayChangePercentage / 100);

      totalValue += currentValue;
      totalCostBasis += h.totalCostBasis;
      totalDayChange += dayChange;

      return {
        ...h,
        currentPrice,
        avgCost,
        currentValue,
        pnl,
        pnlPercentage,
        dayChange,
        dayChangePercentage,
      };
    });

    // Summary
    const totalPnL = totalValue - totalCostBasis;
    const totalPnLPercentage =
      totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;
    const totalDayChangePercentage =
      totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

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
