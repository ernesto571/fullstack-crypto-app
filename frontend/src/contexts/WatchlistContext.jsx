// src/contexts/WatchlistContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios.js"; // shared axios instance with baseURL & withCredentials
import toast from "react-hot-toast";

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from backend when component mounts
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const { data } = await axiosInstance.get("/watchlist");
        console.log("Fetched watchlist:", data);
        setWatchlist(data);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
        // optionally handle unauthorized or empty
      }
    };

    fetchWatchlist();
  }, []);

  // Add coin to watchlist
  const addToWatchlist = async (coin) => {
    try {
      const { data } = await axiosInstance.post("/watchlist", {
        coinId: coin.id,
        name: coin.name,
        price: coin.current_price,
      });

      toast.success(`${coin.name} added to watchlist`);
      setWatchlist(data);
    } catch (error) {
      console.error("Error adding coin:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to add coin. Please make sure you're logged in."
      );
    }
  };

  // Remove coin from watchlist
  const removeFromWatchlist = async (coinId) => {
    try {
      const { data } = await axiosInstance.delete(`/watchlist/${coinId}`);
      toast.success("Removed from watchlist");
      setWatchlist(data);
    } catch (error) {
      console.error("Error removing coin:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to remove coin from watchlist."
      );
    }
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
