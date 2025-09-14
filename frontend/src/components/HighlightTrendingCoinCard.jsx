import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function HighlightTrending({ coin }) {
  // Normalize coin object (supports both API responses)

  return (
    <tr className="text-center  text-[0.9rem] ">
      
      <td className="flex place-items-center py-2 ml-2 text-gray-700  text-[0.9rem]">
        <img
          src={coin.thumb }
          alt={coin.name}
          className="w-[30px] mr-3 rounded-full"
        />
        <p className="mr-3 font-bold text-[0.9rem]">{coin.name}</p>
       
      </td>
      {/* price */}
      <td className="text-gray-900 font-semibold text-[0.9rem]">
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

      
    </tr>
  );
}

export default HighlightTrending;
