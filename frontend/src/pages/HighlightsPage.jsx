import {
  getTopGainers1,
  getTrendingCoins1,
  getTopLosers,
  getHighestVolumeCoins,
} from "../services/Api";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HighlightTrending from "../components/HighlightTrendingCoinCard";
import HighlightGainer from "../components/HighlightGainerCoinCard";
import HighlightVolume from "../components/HighlightVolumeCoinCard";

function Highlights() {
  // separate loading states
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingGainers, setLoadingGainers] = useState(true);
  const [loadingLosers, setLoadingLosers] = useState(true);
  const [loadingVolumes, setLoadingVolumes] = useState(true);

  const [trending, setTrending] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [volumes, setVolumes] = useState([]);

  // Fetch Trending Coins
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const coins = await getTrendingCoins1();
        setTrending(coins);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  // Fetch Gainers
  useEffect(() => {
    const fetchGainers = async () => {
      try {
        const coins = await getTopGainers1();
        setGainers(coins);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingGainers(false);
      }
    };
    fetchGainers();
  }, []);

  // Fetch Losers
  useEffect(() => {
    const fetchLosers = async () => {
      try {
        const coins = await getTopLosers();
        setLosers(coins);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingLosers(false);
      }
    };
    fetchLosers();
  }, []);

  // Fetch Volumes
  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        const coins = await getHighestVolumeCoins();
        setVolumes(coins);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingVolumes(false);
      }
    };
    fetchVolumes();
  }, []);

  return (
    <div className="mt-[49px]">
      <Header />

      {/* heading */}
      <div className="w-[94%] ml-[3%]">
        <h1 className="text-[1.5rem] font-bold text-gray-800 my-3">
          Crypto Highlights
        </h1>
        <p className="text-gray-600 font-semibold">
          Which cryptocurrencies are people more interested in? Track and
          discover the most interesting cryptocurrencies based on market and
          CoinRadar activity.
        </p>

        {/* ✅ Responsive grid: 1 column (sm), 2 columns (md), 3 columns (lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 gap-5">
          {/* Trending */}
          <div className="border-[2px] border-solid border-[#eff2f5] rounded-[10px]">
            <span className="justify-between flex my-3 w-[96%] ml-[2%]">
              <h1 className="text-[1.2rem] font-semibold text-gray-800 mb-2">
                🔥 Trending Coins{" "}
              </h1>
              <Link
                className="text-gray-600 font-semibold flex hover:text-green-500"
                to="/trending-crypto"
              >
                more{" "}
                <ChevronRight size={23} className="pt-[5px]" />
              </Link>
            </span>

            <table className="w-[96%] ml-[2%]">
              <thead>
                <tr className="text-gray-800 font-light border-b-[1px] border-[#eff2f5] text-[0.9rem]">
                  <th className="px-5 py-1 text-left">Coin</th>
                  <th className="px-3 py-1 text-center">Price</th>
                  <th className="px-7 py-1 text-left">24h</th>
                </tr>
              </thead>
              <tbody>
                {loadingTrending ? (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <Loader2 className="size-20 animate-spin text-green-500 mx-auto" />
                    </td>
                  </tr>
                ) : (
                  trending.slice(0, 9).map((coin) => (
                    <HighlightTrending key={coin.id} coin={coin} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Gainers */}
          <div className="border-[2px] border-solid border-[#eff2f5] rounded-[10px]">
            <span className="justify-between flex my-3 w-[96%] ml-[2%]">
              <h1 className="text-[1.2rem] font-semibold text-gray-800 mb-2">
                🚀 Top Gainers{" "}
              </h1>
              <Link
                className="text-gray-600 font-semibold flex hover:text-green-500"
                to="/top-gainers_losers"
              >
                more{" "}
                <ChevronRight size={23} className="pt-[5px]" />
              </Link>
            </span>

            <table className="w-[96%] ml-[2%]">
              <thead>
                <tr className="text-gray-800 font-light border-b-[1px] border-[#eff2f5] text-[0.9rem]">
                  <th className="px-5 py-1 text-left">Coin</th>
                  <th className="px-3 py-1 text-center">Price</th>
                  <th className="px-7 py-1 text-left">24h</th>
                </tr>
              </thead>
              <tbody>
                {loadingGainers ? (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <Loader2 className="size-20 animate-spin text-green-500 mx-auto" />
                    </td>
                  </tr>
                ) : (
                  gainers.slice(0, 9).map((coin) => (
                    <HighlightGainer key={coin.id} coin={coin} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Losers */}
          <div className="border-[2px] border-solid border-[#eff2f5] rounded-[10px]">
            <span className="justify-between flex my-3 w-[96%] ml-[2%]">
              <h1 className="text-[1.2rem] font-semibold text-gray-800 mb-2">
                🚨 Top Losers{" "}
              </h1>
              <Link
                className="text-gray-600 font-semibold flex hover:text-green-500"
                to="/top-gainers_losers"
              >
                more{" "}
                <ChevronRight size={23} className="pt-[5px]" />
              </Link>
            </span>

            <table className="w-[96%] ml-[2%]">
              <thead>
                <tr className="text-gray-800 font-light border-b-[1px] border-[#eff2f5] text-[0.9rem]">
                  <th className="px-5 py-1 text-left">Coin</th>
                  <th className="px-3 py-1 text-center">Price</th>
                  <th className="px-7 py-1 text-left">24h</th>
                </tr>
              </thead>
              <tbody>
                {loadingLosers ? (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <Loader2 className="size-20 animate-spin text-green-500 mx-auto" />
                    </td>
                  </tr>
                ) : (
                  losers.slice(0, 9).map((coin) => (
                    <HighlightGainer key={coin.id} coin={coin} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Highest Volume */}
          <div className="border-[2px] border-solid border-[#eff2f5] rounded-[10px]">
            <span className="justify-between flex my-3 w-[96%] ml-[2%]">
              <h1 className="text-[1.2rem] font-semibold text-gray-800 mb-2">
                🥤 Highest Volume{" "}
              </h1>
              <Link
                className="text-gray-600 font-semibold flex hover:text-green-500"
                to="/high-volume"
              >
                more{" "}
                <ChevronRight size={23} className="pt-[5px]" />
              </Link>
            </span>

            <table className="w-[96%] ml-[2%]">
              <thead>
                <tr className="text-gray-800 font-light border-b-[1px] border-[#eff2f5] text-[0.9rem]">
                  <th className="px-5 py-1 text-left">Coin</th>
                  <th className="px-7 py-1 text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {loadingVolumes ? (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <Loader2 className="size-20 animate-spin text-green-500 mx-auto" />
                    </td>
                  </tr>
                ) : (
                  volumes.slice(0, 9).map((coin) => (
                    <HighlightVolume key={coin.id} coin={coin} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Highlights;
