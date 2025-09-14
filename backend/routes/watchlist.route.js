import express from "express";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "../controllers/watchlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/", protectRoute, addToWatchlist);
router.get("/", protectRoute, getWatchlist);
router.delete("/:coinId", protectRoute, removeFromWatchlist);

export default router;


