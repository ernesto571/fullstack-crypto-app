import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import toast from "react-hot-toast";

function CoinCard3({ coin }) {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const isInWatchlist = watchlist.some((c) => c.coinId === coin.id);
  
  const handleClick = (coinId) => {
    navigate(`/cryptocurrency/${coinId}`);
  };

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(coin.id);
        toast.success(`${coin.name} removed from watchlist`);
      } else {
        await addToWatchlist(coin);
        toast.success(`${coin.name} added to watchlist`);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <tr className="text-center border-b border-[#eff2f5] text-[0.9rem] hover:bg-gray-50 transition-colors">
      {/* Watchlist Star */}
      <td className="px-2">
        <Star
          size={20}
          className={`cursor-pointer transition-colors ${
            isInWatchlist 
              ? "text-yellow-500 fill-yellow-500 hover:text-yellow-600" 
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={handleWatchlistToggle}
        />
      </td>

      {/* Rank */}
      <td className="py-6 text-[0.9rem] font-medium">
        {coin.market_cap_rank || "-"}
      </td>

      {/* Coin Name & Symbol - Sticky Column */}
      <td 
        className="flex items-center py-5 text-gray-700 text-[0.9rem] hover:cursor-pointer sticky left-0 bg-white hover:bg-gray-50 transition-colors z-10 shadow-sm" 
        onClick={() => handleClick(coin.id)}
      >
        <img
          src={coin.image}
          alt={coin.name}
          className="w-8 h-8 mr-3 rounded-full"
          loading="lazy"
        />
        <div className="text-left min-w-0 flex-1">
          <p className="font-bold truncate max-w-[120px] sm:max-w-[150px] lg:max-w-none">
            {coin.name}
          </p>
          <p className="font-semibold text-gray-500 text-xs uppercase truncate">
            {coin.symbol}
          </p>
        </div>
      </td>

      {/* Price */}
      <td className="text-gray-900 font-semibold text-[0.9rem] px-3">
        ${coin.current_price >= 1
          ? coin.current_price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : coin.current_price.toFixed(6)}
      </td>

      {/* 24h Volume */}
      <td className="text-gray-900 font-semibold px-3">
        ${coin.total_volume?.toLocaleString() || "-"}
      </td>

      {/* 24h Market Cap Change */}
      <td className="px-2">
        {coin.market_cap_change_percentage_24h != null ? (
          <div
            className={`flex items-center justify-center gap-1 font-bold text-[0.9rem] ${
              coin.market_cap_change_percentage_24h >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {coin.market_cap_change_percentage_24h >= 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span>
              {Math.abs(coin.market_cap_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
}

export default CoinCard3;