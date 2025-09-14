import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function HighlightGainer({ coin }) {
  // Normalize coin object (supports both API responses)

  return (
    <tr className="text-center  text-[0.9rem] ">
      
      <td className="flex place-items-center py-2 ml-2 text-gray-700  text-[0.9rem] ">
        <img
          src={coin.image }
          alt={coin.name}
          className="w-[30px] mr-3 rounded-full"
        />
        <p className="mr-3 font-bold text-[0.9rem] ">{coin.name}</p>
       
      </td>
      {/* price */}
      <td className="text-gray-900 font-semibold text-[0.9rem]">
                  ${coin.current_price >= 1
                    ? coin.current_price.toLocaleString()
                    : coin.current_price.toFixed(5)}
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

      
    </tr>
  );
}

export default HighlightGainer;
