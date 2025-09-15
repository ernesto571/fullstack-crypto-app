import { getHighestVolumeCoins} from "../services/Api";
  import { useEffect, useState } from "react";
  import { ChevronRight } from "lucide-react";
  import { Link } from "react-router-dom";
  import Footer from "../components/Footer";
  import Header from "../components/Header"; // ✅ import your Header
import HighVolumeCoinCard from "../components/VolumeCoinCard";
  
  function HighVolume() {
    const [highVolume, setHighVolume] = useState([]);
    const [loading, setLoading] = useState(true);
  
    // Fetch Trending Coins (most searched)
    useEffect(() => {
      const fetchHighVolume = async () => {
        try {
          const coins = await getHighestVolumeCoins();
          console.log(coins);
          setHighVolume(coins);
        } catch (error) {
          console.error("Error fetching trending coins:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchHighVolume();
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
        {/* ✅ Use Header instead of rewriting the stats top bar */}
        <Header />
  
        {/* Heading */}
        <div className="mt-5 w-[94%] ml-[3%]">
          <div className="flex gap-4 items-center text-gray-700 mb-5">
            <Link
              to="/"
              className="hover:text-green-500 flex items-center font-semibold text-gray-600"
            >
              Cryptocurrencies{" "}
              <ChevronRight size={25} className="ml-1 pt-[5px]" />
            </Link>
            <Link
              to="/highlights"
              className="hover:text-green-500 flex font-semibold text-gray-600"
            >
              Highlights{" "}
              <ChevronRight size={25} className="ml-1 pt-[5px]" />
            </Link>
            <p className="text-gray-400 font-semibold truncate ">
              High Volume
            </p>
          </div>
  
          <h1 className="text-[1.2rem] lg:text-[1.5rem] md:text-[1.5rem] font-bold text-gray-800 mb-2 truncate ">
          Top 100 Coins by Trading Volume
          </h1>
          <div className="font-semibold">
            <p className="text-gray-600 text-[0.9rem]">
            Discover the top cryptocurrencies with the highest trading volume. This list of coins are ranked based on trading volume in the last 24 hours and are dynamically updated. 
            </p>
  
            
          </div>
  
          {/* Table of trending coins */}
          <div className="w-[100%] my-4 overflow-x-auto ">
            <table className="w-full">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="text-gray-800 font-light border-t-[1px] border-b-[1px] border-solid border-[#eff2f5] text-[0.9rem]">
                  <th className="px-3 md:px-5 lg:px-7 py-2 text-center">#</th>
                  <th className="px-5 py-2 text-left sticky left-0 bg-white z-50 shadow-sm">Coin</th>
                  <th className="px-9 py-2 text-center">Price</th>
                  <th className="px-7 py-2 text-left">24h</th>
                  <th className="px-7 py-2 text-center">24h Volume</th>
                  <th className="px-7 py-2 text-center">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {highVolume.map((coin) => (
                  <HighVolumeCoinCard key={coin.id} coin={coin} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  export default HighVolume;
  