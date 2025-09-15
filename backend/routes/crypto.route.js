import express from "express";
import {
  getGlobalStats,
  getTrendingCoins,
  getTopGainers,
  getTopLosers,
  getCoins,
  getHighestVolumeCoins,
  searchCoins,
  getCoinDetails,
} from "../controllers/crypto.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

// Global stats
router.get("/global",protectRoute, getGlobalStats);

// Trending coins
router.get("/trending",protectRoute, getTrendingCoins);

// Top gainers
router.get("/gainers",protectRoute, getTopGainers);

// Top losers
router.get("/losers",protectRoute, getTopLosers);

// All coins (paginated)
router.get("/coins",protectRoute, getCoins);

// Highest volume coins
router.get("/volume",protectRoute, getHighestVolumeCoins);

// Search coins
router.get("/search",protectRoute, searchCoins);

// Coin details
router.get("/coins/:id",protectRoute, getCoinDetails);

export default router;