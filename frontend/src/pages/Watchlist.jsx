import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { getCoins } from "../services/Api";
import { Star,  Loader2 } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

function WatchlistPage() {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [coinsData, setCoinsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoinsData = async () => {
      if (watchlist.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get current market data for all coins in watchlist
        const allCoins = await getCoins(1, 250); // Get more coins to find all watchlist items
        
        // Filter coins that are in the watchlist
        const watchlistCoins = allCoins.filter(coin => 
          watchlist.some(w => w.coinId === coin.id)
        );
        
        setCoinsData(watchlistCoins);
      } catch (error) {
        console.error("Error fetching coins data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinsData();
  }, [watchlist]);

  const handleClick = (coinId) => {
    navigate(`/cryptocurrency/${coinId}`);
  };

  if (loading) {
    return (
      <div className="w-[98%] lg:w-[94%] lg:ml-[3%] ml-[1%] mt-4">
        <div className="flex items-center justify-center my-[200px]">
          <div className="w-10 h-10 border-4  border-green-500 border-dashed rounded-full animate-spin"></div>

        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className=" mt-[69px]">
        <Header/>
        <div className="text-center justify-items-center pt-[131px] pb-[200px]">
          <p className="text-gray-500 text-lg mb-4">Your watchlist is empty</p>
          <p className="text-gray-400 mb-6">
            Start adding cryptocurrencies to track their performance
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-500 text-white px-6 py-2 rounded-[10px] hover:bg-green-600"
          >
            Browse Cryptocurrencies
          </button>
        </div>
      <Footer/>

      </div>
    );
  }

  return (
    <div>

    <div className="w-[98%] lg:w-[94%] lg:ml-[3%] ml-[1%] mt-[49px] ">
      <Header/>
     
      <h1 className="text-2xl font-bold mb-6 pt-4 text-gray-800">My Watchlist</h1>
      
      <div className="min-h-[400px] overflow-y-auto">
      <table className="w-full">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="text-gray-800 font-light border-t border-b border-[#eff2f5] text-[0.9rem]">
              <th className="px-3 py-2 text-center">{""}</th>
              <th className="px-3 md:px-7 lg:px-7 py-2 text-center">#</th>
              <th className="px-3 py-2 text-left sticky left-0">Coin</th>
              <th className="px-3 py-2 text-center">Price</th>
              <th className="px-4 py-2 text-left">24h</th>
              <th className="px-7 py-2 text-center">ATH</th>
              <th className="px-7 py-2 text-center">24h Volume</th>
              <th className="px-7 py-2 text-center">Market Cap</th>
              <th className="px-7 py-2 text-left">24h</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="py-20 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="size-20 animate-spin text-green-500" />
                  </div>
                </td>
              </tr>
            ) : (
              coinsData.map((coin) => {
                const isInWatchlist = watchlist.some((c) => c.coinId === coin.id);

                return (
                  <tr
                    key={coin.id}
                    className="text-center border-b border-[#eff2f5]">
                    <td>
                      <Star
                          size={20}
                          className={`cursor-pointer ${
                            isInWatchlist ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInWatchlist) {
                              removeFromWatchlist(coin.id);
                            } else {
                              addToWatchlist(coin);
                            }
                          }}
                        />
                    </td>
                    <td className="py-[25px] text-[0.9rem]">
                      {coin.market_cap_rank}
                    </td>
                    <td
                      className="flex place-items-center rounded-full py-[20px] text-gray-700 truncate bg-white hover:cursor-pointer"
                      onClick={() => handleClick(coin.id)}
                    >
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-[30px] mr-3"
                      />
                      <div className="mr-10 block md:flex lg:flex text-[0.9rem] ">
                      <p className="lg:mr-2 md:mr-1 mr-4 font-bold truncate max-w-[120px] sm:max-w-[150px]">
                        {coin.name}
                      </p>
                        <p className="font-semibold text-gray-500">
                          {coin.symbol.toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="text-gray-900 font-semibold text-[0.9rem] ">
                      $
                      {coin.current_price >= 1
                        ? coin.current_price.toLocaleString()
                        : coin.current_price.toFixed(5)}
                    </td>
                    <td
                      className={
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-500 flex px-2 font-bold text-[0.9rem]"
                          : "text-red-500 flex px-2 font-bold text-[0.9rem]"
                      }
                    >
                      {coin.price_change_percentage_24h != null &&
                      coin.price_change_percentage_24h !== "" ? (
                        <>
                          {coin.price_change_percentage_24h >= 0 ? (
                            <ArrowUpRight size={16} className="mt-[4px]" />
                          ) : (
                            <ArrowDownRight size={16} className="mt-[4px]" />
                          )}
                          {coin.price_change_percentage_24h
                            .toFixed(2)
                            .replace("-", "")}
                          %
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="text-gray-900 font-semibold text-[0.9rem]">
                    $
                      {coin.ath >= 1
                        ? coin.ath.toLocaleString()
                        : coin.ath.toFixed(5)}
                    </td>
                    <td className="text-gray-900 font-semibold px-3 text-[0.9rem]">
                      ${coin.total_volume.toLocaleString()}
                    </td>
                    <td className="text-gray-900 font-semibold text-[0.9rem]">
                      ${coin.market_cap.toLocaleString()}
                    </td>
                    <td
                      className={
                        coin.market_cap_change_percentage_24h >= 0
                          ? "text-green-500 flex px-2  font-bold text-[0.9rem]"
                          : "text-red-500 flex px-2 font-bold text-[0.9rem]"
                      }
                    >
                      {coin.market_cap_change_percentage_24h != null &&
                      coin.market_cap_change_percentage_24h !== "" ? (
                        <>
                          {coin.market_cap_change_percentage_24h >= 0 ? (
                            <ArrowUpRight size={16} className="mt-[4px]" />
                          ) : (
                            <ArrowDownRight size={16} className="mt-[4px]" />
                          )}
                          {coin.market_cap_change_percentage_24h
                            .toFixed(2)
                            .replace("-", "")}
                          %
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

      </div>
    </div>
    <Footer/>

    </div>

  );
}

export default WatchlistPage;