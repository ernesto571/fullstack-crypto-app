import { getGlobalStats } from "../services/Api";
import { useEffect, useState } from "react";
import { formatNumber } from "../lib/utils";
import toast from "react-hot-toast";
import SearchBar from './SearchBar'

function Header() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch global stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGlobalStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching global stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10 text-gray-500">
        Loading stats...
      </div>
    );
  }

  if (!stats) {
    <p className="mt-[52px]">
      Failed to lad stats.
    </p>
  }

  return (
    <div className="block border-t border-b border-[#eff2f5]">
      <div className="py-2 lg:py-0 text-[0.9rem] gap-4 md:gap-0 lg:gap-0 md:text-base lg:text-base
                      w-[94%] ml-[3%] text-gray-500 flex text-center place-items-center justify-between">
        
        {/* Stats container with controlled overflow */}
        <div className="flex gap-4 md:gap-6 lg:gap-[10%] overflow-x-auto lg:overflow-visible ">
          <p className="flex whitespace-nowrap">
            Coins:{" "}
            <strong className="text-[#334155] ml-1">
              {stats.active_cryptocurrencies}
            </strong>
          </p>
          <p className="flex whitespace-nowrap">
            Exchanges:{" "}
            <strong className="text-[#334155] ml-1">{stats.markets}</strong>
          </p>
          <p className="whitespace-nowrap">
            Market Cap:{" "}
            <strong className="text-[#334155] ml-1">
              ${formatNumber(stats.total_market_cap?.usd || 0)}
            </strong>
          </p>
          <p className="whitespace-nowrap">
            24h Vol:{" "}
            <strong className="text-[#334155] ml-1">
              ${formatNumber(stats.total_volume?.usd || 0)}
            </strong>
          </p>
          <p className="whitespace-nowrap">
            Dominance:{" "}
            <strong className="text-[#334155] ml-1">
              BTC {Math.round(stats.market_cap_percentage?.btc || 0)}% ETH{" "}
              {Math.round(stats.market_cap_percentage?.eth || 0)}%
            </strong>
          </p>
        </div>

        {/* ✅ Desktop Search - positioned outside overflow container */}
        <div className="hidden lg:block lg:w-[250px] lg:ml-4">
          <SearchBar className="w-full" />
        </div>
      </div>
      
      {/* ✅ Mobile Search */}
      <div className="w-[94%] ml-[3%] mt-1 lg:hidden">
        <SearchBar className="w-full" />
      </div>
    </div>
  );
}

export default Header;