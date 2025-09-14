import express from "express";
import axios from "axios";

const router = express.Router();

const BASE_URL = "https://newsapi.org/v2";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// ✅ General Crypto News
router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: "cryptocurrency OR bitcoin OR ethereum OR crypto",
        sortBy: "publishedAt",
        language: "en",
      },
      headers: {
        "X-Api-Key": NEWS_API_KEY,
      },
    });
    res.json(data.articles);
  } catch (error) {
    console.error("Error fetching crypto news:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// ✅ Specific Coin News
router.get("/:coinId", async (req, res) => {
  const { coinId } = req.params;
  try {
    const { data } = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: coinId,
        sortBy: "publishedAt",
        language: "en",
      },
      headers: {
        "X-Api-Key": NEWS_API_KEY,
      },
    });
    res.json(data.articles);
  } catch (error) {
    console.error(`Error fetching news for ${coinId}:`, error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

export default router;
