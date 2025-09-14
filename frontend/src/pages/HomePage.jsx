import { useEffect, useState } from "react";
import { getGlobalStats, getTopGainers1, getTrendingCoins1, } from "../services/Api";
import { Link } from "react-router-dom";
import { formatNumber } from "../lib/utils";
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
import CoinCard from "../components/CoinCard";
import Footer from "../components/Footer";
import Header from "../components/Header";

function HomePage(){
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch global stats
  useEffect(() => {
    const fetchData = async () => {
      const data = await getGlobalStats();
      setStats(data);
    };
    fetchData();

  }, []);

  // fetch trending
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const coins = await getTrendingCoins1();
        // console.log(coins);
        setTrending(coins);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);   
   

  // fetch top gainers
  useEffect(() => {
    const fetchGainers = async () => {
      try {
        const coins = await getTopGainers1();
        // console.log(coins);
        setGainers(coins);
      } catch (error) {
        console.error("Error fetching trending coins:", error);

      } finally {
      setLoading(false);
    }
    };
    fetchGainers();
  }, []);
        
  if (!stats) return <p>Loading...</p>;

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
    </div>
    );
  }


  return (
    <div className="mt-[49px] max-w-full  min-w-screen">
       <Header/>

        <div className="max-w-[94%] ml-[3%]">
            <h1 className="text-gray-800 font-bold text-[1.2rem] lg:text-[1.5rem] md:text-[1.5rem] mt-2.5 tracking-wide">Cryptocurrency Prices by Market Cap </h1>

            <p className="text-gray-600 mt-1 font-semibold tracking-wide lg:flex md:flex block">The global cryptocurrency market cap today is ${formatNumber(stats.total_market_cap.usd)}rillion, a <span
                        className={ 
                        stats.market_cap_change_percentage_24h_usd >= 0
                            ? "text-green-500 flex ml-[2px] mr-[3px]"
                            : "text-red-500 flex ml-[2px] mr-[3px]"
                        }
                    >
                        {stats.market_cap_change_percentage_24h_usd >= 0 ? (
                        <ArrowUpRight size={16} />
                        ) : (
                        <ArrowDownRight size={16} />
                        )}{stats.market_cap_change_percentage_24h_usd.toFixed(2).replace("-", '')}%
                    </span>  change in the last 24 hours.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 mt-4">
                <div className=" ">
                    {/* market cap */}
                    <div className="border-solid border-[2.5px] border-[#eff2f5] rounded-xl mb-2">
                        <h3 className="text-gray-800 text-[15px] lg:text-[20px] md:text-[20px] ml-3 font-bold mt-3 tracking-wide">${Math.round(stats.total_market_cap.usd).toLocaleString()}</h3>
                        <span className="flex px-3 py-3 text-gray-500 font-bold  text-[0.9rem]  lg:text-lg md:text-lg">
                            Market Cap{""}
                            <p
                                className={ 
                                stats.market_cap_change_percentage_24h_usd >= 0
                                    ? "text-green-500 flex px-2"
                                    : "text-red-500 flex px-2"
                                }
                            >
                                {stats.market_cap_change_percentage_24h_usd >= 0 ? (
                                <ArrowUpRight size={16} />
                                ) : (
                                <ArrowDownRight size={16} />
                                )}
                                {stats.market_cap_change_percentage_24h_usd.toFixed(2).replace("-", '')}%
                            </p>
                        </span>

                    </div>

                    {/* 24h Trading volume */}
                    <div className=" border-solid border-[2.5px] border-[#eff2f5] rounded-xl">
                        <h3 className="text-gray-800 text-[15px] lg:text-[20px] md:text-[20px] ml-3 font-bold mt-3 tracking-wide">${Math.round(stats.total_volume.usd).toLocaleString()}</h3>
                        <p className="flex px-3 py-3 text-gray-500 font-bold text-[0.9rem] lg:text-lg md:text-lg">24h Trading volume</p>
                    </div>
                </div>

                

                {/* 🔥 Trending */}
                <div className="border-solid border-[2.5px] border-[#eff2f5] rounded-xl">
                <div>
                        <span className="flex justify-between px-3 py-4  lg:py-2 place-items-center">
                            <h3 className=" font-semibold text-lg text-gray-700"> 🔥 Trending </h3>
                            <Link className="text-gray-600 font-semibold flex hover:text-green-500" to="/trending-crypto">View more <ChevronRight size={23} className="pt-[5px]"/> </Link>
                        </span>
                        <ul className="flex-row">
                        {trending.slice(0, 3).map((item) => (
                            <span className="flex justify-between " key={item.id}>
                                <span className="flex px-2.5 mb-4  place-items-center">
                                    <img src={item.small} alt={item.symbol} className="w-9 rounded-full" />
                                    <p className='pl-2 text-gray-800 font-semibold text-[0.9rem]  md:text-base lg:text-base'>{item.name}</p>
                                </span>
                                <span className="flex mt-1.5 md:gap-8 md:mr-4 lg:gap-0 lg:mr-0">
                                    <p className=" text-gray-800 font-semibold text-[0.9rem]  md:text-base lg:text-base">{item.data.price.toFixed(5)}</p>

                                    <p
                                        className={ 
                                        item.data.price_change_percentage_24h >= 0
                                            ? "text-green-500 flex px-2 font-bol text-[0.9rem] md:text-base lg:text-base"
                                            : "text-red-500 flex px-2 font-bold text-[0.9rem]  md:text-base lg:text-base"
                                        }
                                    >
                                        {item.data.price_change_percentage_24h >= 0 ? (
                                        <ArrowUpRight size={16} />
                                        ) : (
                                        <ArrowDownRight size={16} />
                                        )}
                                        {item.data.price_change_percentage_24h.usd.toFixed(2).replace("-", '')}%
                                    </p>
                                </span>   
                               
                                
                            </span>
                        ))}
                        </ul>
                    </div>
                </div>

                {/* 🚀 Top Gainers */}
                <div className="border-solid border-[2.5px] border-[#eff2f5] rounded-xl">
                <div>
                        <span className="flex justify-between px-3  py-4  lg:py-2 place-items-center">
                            <h3 className="font-semibold text-lg text-gray-700"> 🚀 Top Gainers </h3>
                            <Link className="text-gray-600 font-semibold flex hover:text-green-500" to="/top-gainers_losers">View more <ChevronRight size={23} className="pt-[5px]"/> </Link>
                        </span>
                        <ul className="flex-row">
                        {gainers.slice(0, 3).map((item) => (
                            <span className="flex justify-between  " key={item.id}>
                                <span className="flex px-2.5 mb-4  place-items-center">
                                    <img src={item.image} alt={item.symbol} className="w-9 rounded-full" />
                                    <p className='pl-2 text-gray-800 font-semibold text-[0.9rem]  md:text-base lg:text-base'>{item.name}</p>
                                </span>
                                <span className="flex mt-1.5 md:gap-8 md:mr-4 lg:gap-0 lg:mr-0 text-[0.9rem] md:text-base lg:text-base">
                                    <p className=" text-gray-800 font-semibold  ">{item.current_price.toFixed(4)}</p>

                                    <p
                                        className={ 
                                        item.ath_change_percentage >= 0
                                            ? "text-green-500 flex px-2 font-bold "
                                            : "text-red-500 flex px-2 font-bold"
                                        }
                                    >
                                        {item.ath_change_percentage >= 0 ? (
                                        <ArrowUpRight size={16} />
                                        ) : (
                                        <ArrowDownRight size={16} />
                                        )}
                                        {item.ath_change_percentage.toFixed(2).replace("-", '')}%
                                    </p>
                                </span>   
                               
                                
                            </span>
                        ))}
                        </ul>
                    </div>
                </div>
                

            </div>          
        </div>
        
        <CoinCard/>
        <Footer/>
    </div>
  )
}

export default HomePage;
