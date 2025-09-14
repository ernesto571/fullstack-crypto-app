import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCoinDetails } from "../services/Api";
import Header from "../components/Header";
import { ChevronRight, Copy, } from "lucide-react";
import { FaTwitter, FaReddit, FaTelegram, FaSearch, FaGithub } from "react-icons/fa";
import { ExternalLink } from "lucide-react";
import NewsPage from "../components/CoinNewsCard";
import Footer from "../components/Footer";
import AddToPortfolioButton from "../components/PortfolioButton";

function CoinDetails() {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [showAllCategories, setShowAllCategories] = useState(false);

  const navigate = useNavigate();

  const [coinAmount, setCoinAmount] = useState(1);
  const [usdValue, setUsdValue] = useState();

  // pagination for tickers
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleCopy = () => {
    navigator.clipboard.writeText(coin.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // when user types coin amount
  const handleCoinChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCoinAmount(value);
    setUsdValue(value * coin.market_data.current_price.usd);
  };

  // when user types usd value
  const handleUsdChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setUsdValue(value);
    setCoinAmount(value / coin.market_data.current_price.usd);
  };

  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        const data = await getCoinDetails(id);
        setCoin(data);
        setUsdValue(data.market_data.current_price.usd); // default usd box value
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinDetails();
  }, [id]);

  // pagination for tickers
  const totalTickers = coin?.tickers?.length || 0;
  const totalPages = Math.ceil(totalTickers / perPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= maxVisible) {
        pages.push(1, 2, 3, "...", totalPages - 1, totalPages);
      } else if (page > totalPages - maxVisible) {
        pages.push(1, 2, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const paginationRange = getPageNumbers();
  const currentTickers = coin?.tickers?.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-[49px]">
      <Header />

      <div className="flex gap-4 items-center text-gray-700  w-[94%] ml-[3%] my-2">
        <Link to="/cryptocurrency" className="hover:text-green-500 flex items-center font-semibold text-gray-600 ">
          Cryptocurrencies{" "}
          <ChevronRight size={25} className="ml-[2px] pt-[5px]" />
        </Link>

        <p className="text-gray-400 font-semibold truncate">{coin.name} Price</p>
      </div>

      <nav className="flex gap-4  w-[100%] py-2 border-b border-gray-200 sticky top-0 bg-white shadow-sm z-50 lg:hidden md:gap-10">
          <a href="#overview" className="hover:text-green-500 ml-[3%]">Overview</a>
          <a href="#about" className="hover:text-green-500">About</a>
          <a href="#market" className="hover:text-green-500">Markets</a>
          <a href="#news" className="hover:text-green-500">News</a>
    </nav>



      <div className="w-[94%] ml-[3%] grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LeftHand Section */}
        <section className=" border-solid border-r border-gray-200" id="overview">
          <div className="flex items-center mt-2 ml-3">
            <img src={coin.image?.small} alt={coin.name} className="w-8 h-8 mt-2  " />
            <span className="font-bold text-[1.2rem] text-gray-800 my-2  ml-3">
              {coin.name} ({coin.symbol.toUpperCase()})
            </span>
            <p className="text-gray-500 ml-1 font-bold text-[1.2rem]">#{coin.market_cap_rank}</p>
          </div>

          {/* price and change */}
          <div className="flex mt-3 mb-2  ml-3">
            <span className="text-2xl  text-gray-800 font-bold">
              $
              {coin.market_data.current_price.usd >= 1
                ? coin.market_data.current_price.usd.toLocaleString()
                : coin.market_data.current_price.usd}
            </span>
            <p
              className={`${
                coin.market_data.price_change_percentage_24h_in_currency.usd >= 0
                  ? "text-green-500 font-bold text-[1.2rem] pt-[2px] ml-2"
                  : "text-red-500 font-bold text-[1.2rem] pt-[2px] ml-2"
              }`}
            >
              {coin.market_data.price_change_percentage_24h_in_currency.usd
                .toFixed(2)
                .replace("-", "")}
              % (24h)
            </p>
          </div>
          <AddToPortfolioButton coin={coin} />

          {/* Market Stats */}
          <section className="w-[96%] ml-[2%] ">
            <div className="flex justify-between border-b border-solid border-gray-200">
              <span className="font-semibold text-gray-600 my-2">Market Cap: </span>
              <p className="my-2 mr-2 font-bold text-gray-800">${coin.market_data.market_cap.usd.toLocaleString()}</p>
            </div>
            <div  className="flex justify-between border-b border-solid border-gray-200">
              <span className="font-semibold text-gray-600  my-2">Fully Diluted Valuation: </span>
              <p className="my-2 mr-2 font-bold text-gray-800">${coin.market_data.fully_diluted_valuation.usd?.toLocaleString()}</p>
            </div >
            <div  className="flex justify-between border-b border-solid border-gray-200">
              <span className="font-semibold text-gray-600  my-2">24h Trading Volume: </span>
              <p className="my-2 mr-2 font-bold text-gray-800">${coin.market_data.total_volume.usd.toLocaleString()}</p>
            </div >
            {coin.market_data.circulating_supply && (
              <div  className="flex justify-between border-b border-solid border-gray-200 ">
                <span className="font-semibold text-gray-600 my-2">Circulating Supply: </span>
                <p className="my-2 mr-2 font-bold text-gray-800">{coin.market_data.circulating_supply.toLocaleString()}</p>
              </div>
            )}

          </section>
          


          {/* Info Section */}
          <section className="mt-4 w-[96%] ml-[2%]" id='info'>
            <h1 className="text-[1.3rem] text-gray-800 font-bold">Info</h1>
            <div className="mt-3">
              {coin.links ? (
                <div className="border-b border-solid border-gray-200 flex justify justify-between">
                  <span className="py-1 font-semibold text-gray-600 ">Website</span>
                  <div >
                    {coin.links.homepage[0] && (
                      <button onClick={() => window.open(coin.links.homepage[0], "_blank")} className="py-1 mb-1 px-2 bg-gray-200 rounded-[9px] font-semibold mr-3 hover:bg-gray-300">
                        {coin.symbol.toLowerCase()}.org 
                      </button>
                    )}
                    {coin.links.whitepaper && (
                      <button onClick={() => window.open(coin.links.whitepaper, "_blank")} className="py-1 mb-1 px-2 bg-gray-200 rounded-[9px] font-semibold mr-3 hover:bg-gray-300">
                        Whitepaper
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                ""
              )}

              <div  className="border-b border-solid border-gray-200 flex justify justify-between">
                <p className="py-3 font-semibold text-gray-600 ">Community</p>

                <div className="flex gap-3 mt-1 mr-3">
                    {coin.links.subreddit_url && (
                      <button onClick={() => window.open(coin.links.subreddit_url, "_blank")} className="py-1 my-2 px-2 bg-gray-200 rounded-[9px] font-semibold  hover:bg-gray-300">
                        <p className="flex"><FaReddit size={17} className="mt-1 mr-2"/> Reddit</p>
                      </button>
                    )}
                    {coin.links.twitter_screen_name && (
                      <button
                        onClick={() =>
                          window.open(`https://twitter.com/${coin.links.twitter_screen_name}`, "_blank")
                        } className="py-1 my-2 px-2 bg-gray-200 rounded-[9px] font-semibold  hover:bg-gray-300"
                      >
                        <p className="flex"><FaTwitter size={17} className="mt-1 mr-2"/> Twitter</p>
                      </button>
                    )}
                    {coin.links.telegram_channel_identifier && (
                      <button
                        onClick={() =>
                          window.open(`https://t.me/${coin.links.telegram_channel_identifier}`, "_blank")
                        } className="py-1 my-2 px-2 bg-gray-200 rounded-[9px] font-semibold  hover:bg-gray-300"
                      >
                        <p className="flex"><FaTelegram size={17} className="mt-1 mr-2"/> Telegram</p>
                      </button>
                    )}

                </div>

                
              </div>

              {/* Github */}
              <div className="border-b border-solid border-gray-200 flex justify justify-between mr-3">
                <p className="flex py-3 font-semibold text-gray-600"> Source Code <FaSearch size={17} className="mt-1 ml-2 text-gray-500"/></p>
                {coin.links.repos_url.github && (
                  <button onClick={() => window.open(`${coin.links.repos_url.github[0]}`, "_blank")} className="py-1 my-2 px-2 bg-gray-200 rounded-[9px] font-semibold  hover:bg-gray-300">
                    <p className="flex"><FaGithub size={17} className="mt-1 mr-2"/> Github </p>
                  </button>
                )}
              </div>

              {/* API ID */}
              <div className="border-b border-solid border-gray-200 flex justify justify-between mr-3">
                <p className="py-3 font-semibold text-gray-600 ">API ID</p>
                {coin.id && (
                  <button
                    onClick={handleCopy}
                    className="py-1 my-2 px-2 bg-gray-200 rounded-[9px] font-semibold  hover:bg-gray-300"
                  >
                    <span className="flex"> <Copy size={17} className="mt-1 mr-2"/>
                    {copied ? "Copied!" : coin.id}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Categories with toggle */}
            <div className="border-b border-solid border-gray-200 flex justify justify-between gap-[120px] mr-3">
              <p className="py-3 font-semibold text-gray-600 ">Categories</p>
              {coin.categories?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(showAllCategories
                    ? coin.categories
                    : coin.categories.slice(0, 1)
                  ).map((cat, i) => (
                    <li
                      key={i}
                      className="py-1 my-2 px-2 bg-gray-200 rounded-[9px] font-semibold  hover:bg-gray-300 block"
                    >
                      {cat}
                    </li>
                  ))}

                  {coin.categories.length > 1 && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="py-1 my-2 px-2 bg-gray-200 rounded-[9px] font-semibold  hover:bg-gray-300"
                    >
                      {showAllCategories
                        ? "Show less"
                        : `+${coin.categories.length - 1} more`}
                    </button>
                  )}
                </div>
              )}
            </div>
  
          </section>

          {/* Converter */}
          <div className="  w-[93%] ml-[3%] my-5 border-solid border-y-[1px] border-gray-200">
            <h3 className="text-[1.3rem] text-gray-800 font-bold my-3">{coin.symbol.toUpperCase()} Converter</h3>
            <div className="flex flex-col gap-3 w-[90%]">
              {/* Coin input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={coinAmount}
                  onChange={handleCoinChange}
                  className="flex-1 p-2 border rounded focus:outline-none focus:border-[2px] focus: border-solid focus:border-green-500"
                />
                <span className="font-semibold uppercase ml-3">{coin.symbol}</span>
              </div>

              {/* USD input */}
              <div className="flex items-center gap-3 mb-5">
                <input
                  type="number"
                  value={usdValue}
                  onChange={handleUsdChange}
                  className="flex-1 p-2 border rounded focus:outline-none focus:border-[2px] focus: border-solid focus:border-green-500"
                />
                <span className="font-semibold ml-2">USD</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right section */}
        <section id="about">
          {/* About */}
          <div className="mt-2">
            <h1 className="text-[1.2rem] text-gray-800 font-semibold mb-3">About {coin.name}</h1>
            <p className="text-gray-700 text-[0.9rem] md:text-base lg:text base">{coin.description.en}</p>
          </div>
          {/* Historical price */}
          <div className="my-5 border-t border-solid border-gray-200">
            <h1 className="text-[1.3rem] text-gray-800 font-bold my-1">{coin.symbol.toUpperCase()} Historical Price</h1>
            {/* 24h */}
            <div>
              <div className="border-b border-solid border-gray-200 flex  justify-between  mr-3">
                <h3  className="font-semibold text-gray-600  my-2">24h Range</h3>
                <span className="my-2 mr-2 font-bold text-gray-800">
                  <p>
                    ${coin.market_data.low_24h.usd >= 1
                      ? coin.market_data.low_24h.usd.toLocaleString()
                      : coin.market_data.low_24h.usd} - ${coin.market_data.high_24h.usd >= 1
                        ? coin.market_data.high_24h.usd.toLocaleString()
                        : coin.market_data.high_24h.usd}
                  </p>
                </span>
              </div>
            </div>
            {/* ATH */}
            <div>
              <div className="border-b border-solid border-gray-200 flex  justify-between  mr-3">
                <h3  className="font-semibold text-gray-600  my-5">All-Time High</h3>
                <span  className="my-2 mr-2 font-bold text-gray-800 block">
                  <p>
                    ${coin.market_data.ath.usd >= 1
                      ? coin.market_data.ath.usd.toLocaleString()
                      : coin.market_data.ath.usd}
                  </p>
                  <p className="text-gray-500 font-semibold">{coin.market_data.ath_date.usd.split("T")[0]}</p>
                </span>
              </div>
            </div>
            {/* ATL */}
            <div>
              <div  className="border-b border-solid border-gray-200 flex  justify-between  mr-3">
                <h3  className="font-semibold text-gray-600  my-5">All-Time Low</h3>
                <span className="my-2 mr-2 font-bold text-gray-800 block">
                  <p>
                    ${coin.market_data.atl.usd >= 1
                      ? coin.market_data.atl.usd.toLocaleString()
                      : coin.market_data.atl.usd}
                  </p>
                  <p className="text-gray-500 font-semibold">{coin.market_data.atl_date.usd.split("T")[0]}</p>
                </span>
              </div>
            </div>
          </div>

          {/* ======= Tickers Section ======= */}
          <section className="mt-8 overflow-y-auto" id='market'>
            <h1  className="text-[1.3rem] text-gray-800 font-bold my-1">{coin.name} Markets</h1>
            <p className="text-[0.9rem] mb-2 text-gray-500">Affiliate disclosures </p>
            <table className="w-full  ">
              <thead className="sticky top-0 bg-white shadow-sm z-10 ">
                <tr className="text-gray-800 font-light border-t border-b border-solid border-[#eff2f5] text-[0.9rem]">
                  <th className="px-1 py-2 text-center">#</th>
                  <th className="px-3 py-2 text-left">Exchange</th>
                  <th className="px-3 py-2 text-left ">Pair</th>
                  <th className="px-3 py-2 text-center">Price</th>
                  <th className="px-3 py-2 text-center">Volume</th>
                  <th className="px-3 py-2 text-center">Trust</th>
                </tr>
              </thead>
              <tbody>
                {currentTickers?.map((ticker, index) => (
                  <tr
                    key={index}
                    className="text-center border-b border-solid border-[#eff2f5] "
                  >
                    
                    <td className=" pr-2">{(page - 1) * perPage + index + 1}</td>
                    <td className="text-left py-[10px] text-gray-900 font-semibold md:whitespace-nowrap lg:whitespace-nowrap">{ticker.market.name}</td>
                    <td className="text-left px-3">
                    <a 
                        href={ticker.trade_url} 
                        target="_blank" 
                        rel="noopener noreferrer" className="flex items-center gap-1  hover:text-green-400">
                        {ticker.base}/{ticker.target}
                        <ExternalLink size={14} />
                      </a>                    
                    </td>
                    <td className="text-gray-900 font-semibold text-[0.9rem] ">
                      ${ticker.last.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="text-gray-900 font-semibold text-[0.9rem]">
                      ${ticker.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td
                      className={`font-bold ${
                        ticker.trust_score === "green"
                          ? "text-green-400"
                          : ticker.trust_score === "red"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {ticker.trust_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 gap-1">
  <button
    onClick={() => setPage((prev) => prev - 1)}
    disabled={page === 1}
    className="px-3 py-1 rounded disabled:opacity-50"
  >
    Prev
  </button>

  {paginationRange.map((p, idx) => (
    <button
      key={typeof p === "number" ? `page-${p}` : `dots-${idx}`}
      onClick={() => typeof p === "number" && setPage(p)}
      disabled={p === "..."}
      className={`px-3 py-1 rounded ${
        page === p ? "font-bold bg-green-400 text-white" : ""
      }`}
    >
      {p}
    </button>
  ))}

  <button
    onClick={() => setPage((prev) => prev + 1)}
    disabled={page === totalPages}
    className="px-3 py-1 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>

          </section>
        </section>

        
        
      </div>
      <section id='news'>
        <NewsPage coinId={coin.id} />

      </section>
      <Footer/>
    </div>
  );
}

export default CoinDetails;
