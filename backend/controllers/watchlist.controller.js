import User from "../models/user.model.js";

// Add coin to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { coinId, name, price } = req.body;
    const userId = req.user.id; // from auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if coin already exists in watchlist
    const existingCoin = user.watchlist.find(c => c.coinId === coinId);
    if (existingCoin) {
      return res.status(400).json({ message: "Coin already in watchlist" });
    }

    // Add coin to watchlist
    user.watchlist.push({ coinId, name, price });
    await user.save();
    
    res.json(user.watchlist);
  } catch (err) {
    console.error("Add to watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get watchlist
export const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.watchlist);
  } catch (err) {
    console.error("Get watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Remove coin from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { coinId } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Filter out the coin to remove
    user.watchlist = user.watchlist.filter(c => c.coinId !== coinId);
    await user.save();
    
    res.json(user.watchlist);
  } catch (err) {
    console.error("Remove from watchlist error:", err);
    res.status(500).json({ error: err.message });
  }
};