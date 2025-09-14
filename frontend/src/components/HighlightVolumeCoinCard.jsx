import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function HighlightVolume({ coin }) {
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
      

      {/* total volume*/}
      <td className="text-gray-900 font-semibold">
                  ${coin.total_volume?.toLocaleString()}
                </td>

      
    </tr>
  );
}

export default HighlightVolume;
