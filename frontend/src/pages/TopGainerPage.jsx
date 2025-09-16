import {
  getTopGainers1,
  getTopLosers
} from "../services/Api";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import CoinCard3 from "../components/CoinCard3";
import Footer from "../components/Footer";
import Header from "../components/Header"; // ✅ import Header
import toast from "react-hot-toast";

function TopGainer() {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch top gainers
  useEffect(() => {
    const fetchGainers = async () => {
      try {
        const coins = await getTopGainers1();
        setGainers(coins);
      } catch (err) {
        if (err.response && err.response.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || 60;
          toast.error(
            `Too many requests. Try again after ${retryAfter} seconds.`
          );
        } else {
          console.log(err);
        }
      }
    };
    fetchGainers();
  }, []);

  // fetch top losers
  useEffect(() => {
    const fetchLosers = async () => {
      try {
        const coins = await getTopLosers();
        setLosers(coins);
      } catch (err) {
        if (err.response && err.response.status === 429) {
          const retryAfter = err.response.headers["retry-after"] || 60;
          toast.error(
            `Too many requests. Try again after ${retryAfter} seconds.`
          );
        } else {
          console.log(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLosers();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-[49px] min-h-screen">
      {/* ✅ Use Header instead of rewriting stats bar */}
      <Header />

      {/* Heading */}
      <div className="mt-5 w-[94%] ml-[3%]">
        <div className="flex gap-4 items-center text-gray-700 mb-3">
            <Link
              to="/"
              className="hover:text-green-500 flex items-center font-semibold text-gray-600"
            >
              Cryptocurrencies{" "}
              <ChevronRight size={22} className="ml-1 mt-[2px]" />
            </Link>
            <Link
              to="/highlights"
              className="hover:text-green-500 flex font-semibold text-gray-600"
            >
              Highlights{" "}
              <ChevronRight size={22} className="ml-1 mt-[2px]" />
            </Link>
          <p className="text-gray-400 font-semibold truncate">
            Top Crypto Gainers and Losers
          </p>
        </div>

        <h1 className="text-[1.2rem] lg:text-[1.5rem] md:text-[1.5rem] font-bold text-gray-800 mb-2">
          Top Crypto Gainers and Losers
        </h1>

        <p className="text-gray-600 font-semibold text-[0.9rem]">
          Discover the largest gainers and losers across all major
          cryptocurrencies listed on CoinRadar, based on price movements in the
          last 24 hours.
        </p>

        {/* ✅ Responsive grid: 1 col on small/medium, 2 cols on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6">
          {/* Gainers */}
          <div className="w-full">
            <h1 className="text-[1.2rem] font-bold text-gray-800 mb-4">
              🚀 Top Gainers
            </h1>
            <div className="overflow-x-auto">
              <table className="w-full ">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-gray-800 font-light border-t-[1px] border-b-[1px] border-solid border-[#eff2f5] text-[0.9rem]">
                    <th className="px-3 py-2 text-center">{""}</th>
                    <th className="px-3 py-2 text-center">#</th>
                    <th className="px-3 py-2 text-left sticky left-0 z-10 shadow-sm">Coin</th>
                    <th className="px-7 py-2 text-center">Price</th>
                    <th className="px-7 py-2 text-center">24h Volume</th>
                    <th className="px-7 py-2 text-center">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {gainers.map((coin) => (
                    <CoinCard3 key={coin.id || coin.item?.id} coin={coin} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Losers */}
          <div className="w-full">
            <h1 className="text-[1.2rem] font-bold text-gray-800 mb-4">
              🚨 Top Losers
            </h1>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-gray-800 font-light border-t-[1px] border-b-[1px] border-solid border-[#eff2f5] text-[0.9rem]">
                    <th className="px-3 py-2 text-center">{""}</th>
                    <th className="px-3 py-2 text-center">#</th>
                    <th className="px-3 py-2 text-left sticky left-0 z-10 bg-white shadow-sm">Coin</th>
                    <th className="px-7 py-2 text-center">Price</th>
                    <th className="px-7 py-2 text-center">24h Volume</th>
                    <th className="px-7 py-2 text-center">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {losers.map((coin) => (
                    <CoinCard3 key={coin.id || coin.item?.id} coin={coin} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TopGainer;
