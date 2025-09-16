import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchCoins } from "../services/Api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";


function SearchResults() {
  const [searchParams] = useSearchParams();
  const coinQuery = searchParams.get("coin");
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (coinQuery) {
      setLoading(true);
      searchCoins(coinQuery).then((results) => {
        setCoins(results || []);
        setLoading(false);
      });
    }
  }, [coinQuery]);

  const handleClick = (coinId) => {
    navigate(`/cryptocurrency/${coinId}`);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
    </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="p-6">
        <Header />
        <p className="text-gray-500">No coins found for "{coinQuery}"</p>
      </div>
    );
  }

  return (
    <div className="mt-[49px]">
      <Header />
      <div className="p-6 w-[96%] ml-[2%]">
        <div className="flex mb-3">
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
            <p className="text-gray-400 font-semibold truncate ml-1">
              Search Results
            </p>
        </div>
          
        <h1 className="text-2xl font-bold mb-4 text-gray-800 truncate">
          Search Results for "
          {coinQuery.charAt(0).toUpperCase() + coinQuery.slice(1)}"
        </h1>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {coins.map((coin) => (
            <li
              key={coin.id}
              onClick={() => handleClick(coin.id)}
              className="border-[2px] border-b-[5px] border-solid border-[#cfcfcf] rounded-[10px] hover:cursor-pointer hover:bg-[#eff3f5] transition"
            >
              <div className="ml-4 mt-3">
                <div className="flex gap-3 items-center">
                  <p className="text-gray-800 font-bold">
                    {coin.market_cap_rank || "N/A"}
                  </p>
                  <img
                    src={coin.thumb}
                    alt={coin.name}
                    className="w-10 h-10 rounded-full"
                  />
                </div>

                <div>
                  <p className="font-bold mt-3 text-gray-700 truncate">
                    {coin.name}
                  </p>
                  <p className="text-gray-500 uppercase font-bold mt-3 mb-5">
                    {coin.symbol}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  );
}

export default SearchResults;
