import axios from "axios";

const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

// Create a reusable axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-cg-demo-api-key": API_KEY, // CoinGecko key header
  },
});

// ======================
// Rate-limit Safe Layer
// ======================
let cache = {};
const DEFAULT_TTL = 60 * 2000; // 1 minute cache

// Retry logic with exponential backoff
api.interceptors.response.use(null, async (error) => {
  if (error.response && error.response.status === 429) {
    let retryAfter = error.response.headers["retry-after"];
    let delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000; // fallback 2s
    console.warn(`429 Too Many Requests, retrying after ${delay / 1000}s...`);

    await new Promise((res) => setTimeout(res, delay));
    return api.request(error.config);
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

  const { data } = await api.get(url, { params });
  cache[key] = { data, timestamp: now };
  return data;
};

// ======================
// API Functions
// ======================

// GLOBAL STATS
export const getGlobalStats = async () => {
  try {
    const data = await safeFetch("/global", {}, 60 * 1000);
    return data.data;
  } catch (error) {
    console.error("Error fetching global stats:", error);
    return null;
  }
};


// TRENDING
export const getTrendingCoins1 = async () => {
  const data = await safeFetch("/search/trending", {}, 5 * 60 * 1000);
  return data.coins.map((c) => c.item);
};

// TOP GAINERS
export const getTopGainers1 = async () => {
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

  return data.sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  );
};

// TOP LOSERS
export const getTopLosers = async () => {
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

  return data.sort(
    (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
  );
};

// ALL COINS (paginated)
export const getCoins = async (page) => {
  try {
    return await safeFetch(
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
  } catch (error) {
    console.error("Error fetching coins:", error);
    return [];
  }
};

// HIGHEST VOLUME
export const getHighestVolumeCoins = async () => {
  try {
    return await safeFetch(
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
  } catch (error) {
    console.error("Error fetching highest volume coins:", error);
    return [];
  }
};

// SEARCH COINS
export const searchCoins = async (query) => {
  try {
    const data = await safeFetch(
      "/search",
      { query },
      2 * 60 * 1000 // cache results for 2 minutes
    );
    return data.coins; // only return coins (ignores exchanges, categories, NFTs)
  } catch (error) {
    console.error("Error searching coins:", error);
    return [];
  }
};

export const getCoinDetails = async (id) => {
  try {
    const data = await safeFetch(`/coins/${id}`, {}, 5 * 60 * 1000); // cache 5min
    console.log(data)
    return data;
  } catch (error) {
    console.error(`Error fetching ${id} details:`, error);
    return null;
  }
};


