import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCoins } from "../services/Api";
import { Star, Loader2 } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useWatchlist } from "../contexts/WatchlistContext";
import toast from "react-hot-toast"

function CoinCard() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const initialPage =
    Number(query.get("page")) > 0 ? Number(query.get("page")) : 1;

  const [coins, setCoins] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const totalPages = 160; // fixed total pages

  // fetch coins on page change
  useEffect(() => {
    navigate(`?page=${page}`, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      setLoading(true);
      const data = await getCoins(page);
      setCoins(data);
      setLoading(false);
    };
    fetchData();
  }, [page, navigate]);

  const handleClick = (coinId) => {
    navigate(`/cryptocurrency/${coinId}`);
  };

  // generate pagination numbers
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (page <= 3) return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  // page handlers
  const handleNext = () =>
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const handlePrev = () =>
    setPage((prev) => (prev >= 1 ? prev - 1 : prev));

  return (
    <div className="w-[98%] lg:w-[94%] lg:ml-[3%] ml-[1%] mt-4">
      <div className="max-h-[1000px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="text-gray-800 font-light border-t border-b border-[#eff2f5] text-[0.9rem]">
              <th className="px-3 py-2 text-center">{""}</th>
              <th className="px-3 md:px-7 lg:px-7 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left ">Coin</th>
              <th className="px-3 py-2 text-left">Price</th>
              <th className="px-7 py-2 text-left">24h</th>
              <th className="px-7 py-2 text-left">ATH</th>
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
              coins.map((coin) => {
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
                      <div className="mr-3 block md:flex lg:flex text-[0.9rem] ">
                      <p className="lg:mr-2 md:mr-1 mr-4 font-bold truncate max-w-[120px] sm:max-w-[180px]">
                        {coin.name}
                      </p>
                        <p className="font-semibold text-gray-500">
                          {coin.symbol.toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="text-gray-900 font-semibold text-[0.9rem]">
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

      {/* Pagination controls */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {getPageNumbers().map((p, index) =>
          p === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          ) : (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded ${
                page === p ? "font-bold bg-green-400 text-white" : ""
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CoinCard;
