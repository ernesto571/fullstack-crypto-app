import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CoinCard2({ coin }) {
  // Normalize coin object (supports both API responses)
  const navigate = useNavigate()


  const handleClick = (coinId) => {
    navigate(`/cryptocurrency/${coinId}`);
  };


  return (
    <tr className="text-center border-solid border-b-[1px] border-[#eff2f5] text-[0.9rem]">
      
      <td className="py-[25px]  text-[0.9rem]">{coin.market_cap_rank || "-"}</td>
      <td className="flex place-items-center py-[20px]  text-gray-700 whitespace-nowrap text-[0.9rem] hover:cursor-pointer" onClick={() => handleClick(coin.id)}>
        <img
          src={coin.thumb }
          alt={coin.name}
          className="w-[30px] mr-3 truncate rounded-full"
        />
        <div className="block lg:flex  mr-3 lg:mr-0 ">
        <p className="lg:mr-2 md:mr-1 mr-4 font-bold truncate max-w-[120px] sm:max-w-[200px]">
                        {coin.name}
                      </p>          <p className="font-semibold text-gray-500 justify-center items-center text-[0.9rem]">
            {coin.symbol.toUpperCase()}
          </p>
        </div>
        
      </td>
      <td className="text-gray-900 font-semibold text-[0.9rem] justify-center items-center">
        ${coin.data.price >= 1
          ? coin.data.price.toLocaleString()
          : coin.data.price.toFixed(5)}
      </td>

      {/* 24h price change */}
      <td
          className={
            coin.data.price_change_percentage_24h.usd >= 0
              ? "text-green-500 flex px-2 font-bold justify-center items-center text-[0.9rem]"
              : "text-red-500 flex px-2 font-bold justify-center items-center text-[0.9rem]"
          }
        >
          {coin.data.price_change_percentage_24h.usd != null ? (
            <>
              {coin.data.price_change_percentage_24h.usd >= 0 ? (
                <ArrowUpRight size={16} className="mt-[4px]" />
              ) : (
                <ArrowDownRight size={16} className="mt-[4px]" />
              )}
              {coin.data.price_change_percentage_24h.usd
                .toFixed(2)
                .replace("-", "")}
              %
            </>
          ) : (
            "-"
          )}
      </td>

      {/* Volume */}
      <td className="text-gray-900 font-semibold text-[0.9rem]">
                  {coin.data.total_volume?.toLocaleString()}
                </td>

      {/* Market Cap */}
      <td className="text-gray-900 font-semibold text-[0.9rem]">
                  {coin.data.market_cap?.toLocaleString()}
                </td>
    </tr>
  );
}

export default CoinCard2;
