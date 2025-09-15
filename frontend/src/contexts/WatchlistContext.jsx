// src/contexts/WatchlistContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  // ✅ Load watchlist from backend when component mounts
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/api/watchlist", {
          withCredentials: true, // Use cookies instead of Bearer token
        });
        console.log("Fetched watchlist:", data);
        setWatchlist(data); // Store the full watchlist objects
      } catch (error) {
        console.error("Error fetching watchlist:", error);
        // If user is not logged in, just keep empty watchlist
        setWatchlist(data);
      }
    };
    
    fetchWatchlist();
  }, []);

  // ✅ Add coin to watchlist
  const addToWatchlist = async (coin) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/watchlist",
        {
          coinId: coin.id,
          name: coin.name,
          price: coin.current_price,
        },
        { withCredentials: true }
      );
      
      console.log("Added to watchlist:", data);
      setWatchlist(data); // Update with full watchlist from server
    } catch (error) {
      console.error("Error adding coin:", error);
      toast.error("Failed to add coin to watchlist. Please make sure you're logged in.");
    }
  };

  // ✅ Remove coin from watchlist
  const removeFromWatchlist = async (coinId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:5001/api/watchlist/${coinId}`,
        { withCredentials: true }
      );
      toast.success("Removed from watchlist")
      console.log("Removed from watchlist:", data);

      setWatchlist(data); // Update with full watchlist from server
    } catch (error) {
      toast.error("Failed to remove coin from watchlist.");
      console.error("Error removing coin:", error);
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