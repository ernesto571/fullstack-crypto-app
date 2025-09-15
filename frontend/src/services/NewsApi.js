import axios from "axios";

const API_BASE = "https://fullstack-crypto-app.onrender.com/api"; // 👈 your backend URL

// 🔹 General Crypto News
export const getCryptoNews = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/news`);
    return data; // array of articles
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return [];
  }
};

// 🔹 Specific Coin News
export const getCoinNews = async (coinId) => {
  try {
    const { data } = await axios.get(`${API_BASE}/news/${coinId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching news for ${coinId}:`, error);
    return [];
  }
};
