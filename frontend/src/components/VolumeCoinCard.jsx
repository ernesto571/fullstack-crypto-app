import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";


function HighVolumeCoinCard({ coin }) {
  // Normalize coin object (supports both API responses)

  const navigate = useNavigate()

  const handleClick = (coinId) => {
    navigate(`/cryptocurrency/${coinId}`);
  };

  return (
    <tr className="text-center border-solid border-b-[1px] border-[#eff2f5] text-[0.9rem]">
      
      <td className="py-[25px] text-[0.9rem]">{coin.market_cap_rank || "-"}</td>
      <td className="flex place-items-center py-[20px] rounded-full text-gray-700 text-[0.9rem] hover:cursor-pointer sticky left-0 bg-white hover:bg-gray-50 transition-colors z-10 shadow-sm" onClick={() => handleClick(coin.id)}>
        <img
          src={coin.image }
          alt={coin.name}
          className="w-[30px] mr-3"
        />
        <div className="block lg:flex  mr-7 lg:mr-0">
          <p className="lg:mr-3 font-bold">{coin.name}</p>
          <p className="font-semibold text-gray-500">
            {coin.symbol.toUpperCase()}
          </p>

        </div>
        
      </td>
      <td className="text-gray-900 font-semibold text-[0.9rem]">
                  ${coin.current_price >= 1
                    ? coin.current_price.toLocaleString()
                    : coin.current_price.toFixed(5)}
                </td>

      {/* Volume */}

                <td className="text-gray-900 font-semibold">
                  ${coin.total_volume?.toLocaleString()}
                </td>
      {/* 24h price change */}
      <td
                  className={
                    coin.market_cap_change_percentage_24h >= 0
                      ? "text-green-500 flex px-2 font-bold justify-center items-center text-[0.9rem]"
                      : "text-red-500 flex px-2 font-bold justify-center items-center text-[0.9rem]"
                  }
                >
                  {coin.market_cap_change_percentage_24h != null ? (
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
                    "-"
                  )}
                </td>

      

      {/* Market Cap */}
      <td className="text-gray-900 font-semibold">
                  ${coin.market_cap?.toLocaleString()}
                </td>
    </tr>
  );
}

export default HighVolumeCoinCard;
