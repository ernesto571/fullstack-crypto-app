import axios from "axios";

const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY;

// Create axios instance
const coinGeckoAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-cg-demo-api-key": API_KEY,
  },
});

// Cache for rate limiting
let cache = {};
const DEFAULT_TTL = 60 * 1000; // 1 minute

// Retry logic with exponential backoff
coinGeckoAPI.interceptors.response.use(null, async (error) => {
  if (error.response && error.response.status === 429) {
    let retryAfter = error.response.headers["retry-after"];
    let delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
    console.warn(`429 Too Many Requests, retrying after ${delay / 1000}s...`);
    
    await new Promise((res) => setTimeout(res, delay));
    return coinGeckoAPI.request(error.config);
  }
  return Promise.reject(error);
});

// Cached fetch wrapper
const safeFetch = async (url, params = {}, ttl = DEFAULT_TTL) => {
  const key = `${url}_${JSON.stringify(params)}`;
  const now = Date.now();

  if (cache[key] && now - cache[key].timestamp < ttl) {
    return cache[key].data;
  }

  const { data } = await coinGeckoAPI.get(url, { params });
  cache[key] = { data, timestamp: now };
  return data;
};

// ======================
// CONTROLLER FUNCTIONS
// ======================

// GLOBAL STATS
export const getGlobalStats = async (req, res) => {
  try {
    const data = await safeFetch("/global", {}, 60 * 1000);
    res.json(data.data);
  } catch (error) {
    console.error("Error fetching global stats:", error);
    res.status(500).json({ message: "Failed to fetch global stats" });
  }
};

// TRENDING COINS
export const getTrendingCoins = async (req, res) => {
    try {
      const data = await safeFetch("/search/trending", {}, 5 * 60 * 1000);
      console.log("Raw CoinGecko trending response:", JSON.stringify(data, null, 2));
      
      if (data && data.coins) {
        const trending = data.coins.map((c) => c.item);
        console.log("Processed trending data:", JSON.stringify(trending[0], null, 2));
        res.json(trending);
      } else {
        console.log("No coins data in response");
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching trending coins:", error);
      res.status(500).json({ message: "Failed to fetch trending coins" });
    }
  };

// TOP GAINERS
export const getTopGainers = async (req, res) => {
  try {
    const data = await safeFetch(
      "/coins/markets",
      {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 30,
        page: 1,
        sparkline: false,
      },
      2 * 60 * 1000
    );

    const gainers = data.sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );
    res.json(gainers);
  } catch (error) {
    console.error("Error fetching top gainers:", error);
    res.status(500).json({ message: "Failed to fetch top gainers" });
  }
};

// TOP LOSERS
export const getTopLosers = async (req, res) => {
  try {
    const data = await safeFetch(
      "/coins/markets",
      {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 30,
        page: 1,
        sparkline: false,
      },
      2 * 60 * 1000
    );

    const losers = data.sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    );
    res.json(losers);
  } catch (error) {
    console.error("Error fetching top losers:", error);
    res.status(500).json({ message: "Failed to fetch top losers" });
  }
};

// ALL COINS (paginated)
export const getCoins = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await safeFetch(
      "/coins/markets",
      {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page,
        sparkline: false,
      },
      5 * 60 * 1000
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching coins:", error);
    res.status(500).json({ message: "Failed to fetch coins" });
  }
};

// HIGHEST VOLUME
export const getHighestVolumeCoins = async (req, res) => {
  try {
    const data = await safeFetch(
      "/coins/markets",
      {
        vs_currency: "usd",
        order: "volume_desc",
        per_page: 40,
        page: 1,
        sparkline: false,
      },
      2 * 60 * 1000
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching highest volume coins:", error);
    res.status(500).json({ message: "Failed to fetch highest volume coins" });
  }
};

// SEARCH COINS
export const searchCoins = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const data = await safeFetch(
      "/search",
      { query },
      2 * 60 * 1000
    );
    res.json(data.coins);
  } catch (error) {
    console.error("Error searching coins:", error);
    res.status(500).json({ message: "Failed to search coins" });
  }
};

// COIN DETAILS
export const getCoinDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await safeFetch(`/coins/${id}`, {}, 5 * 60 * 1000);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching ${req.params.id} details:`, error);
    res.status(500).json({ message: "Failed to fetch coin details" });
  }
};