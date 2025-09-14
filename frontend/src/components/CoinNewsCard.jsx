import { useEffect, useState } from "react";
import { getCryptoNews, getCoinNews } from "../services/NewsApi";

function NewsPage({ coinId }) {
  const [articles, setArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4); // start with 4
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchNews = async () => {
        try{
            let news;
            if (!coinId) {
                setArticles([]); // clear news if no coinId
                return;
              }
              
           
             else {
                news = await getCoinNews(coinId);; 
            }
            setArticles(news);

        }catch(err){
            console.error(err)
        }finally{
            setLoading(false)
        }
      
    };

    fetchNews();
  }, [coinId]);

  const handleShowMore = () => {
    // show up to 20 articles total
    setVisibleCount((prev) => Math.min(prev + 4, 20));
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );}

  return (
    <section className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {coinId ? `Crypto Related News` : ''}
      </h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        {articles.slice(0, visibleCount).map((article, index) => (
          <div
            key={index}
            onClick={() => window.open(article.url, "_blank")}
            className="cursor-pointer border-b border-gray-200 w-[96%] ml-[2%]  hover:shadow-md transition"
          >
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="object-cover mb-2 rounded-t-[10px] h-[200px] w-[100%]  text-blue-600"
              />
            )}
            <h3 className="font-semibold mt-3 px-2">{article.title}</h3>
            {/* <p className="text-gray-700 mt-2 line-clamp-3">
              {article.description}
            </p> */}
            <p className=" text-gray-600 my-2 px-2">{article.source.name}</p>
            <p className="text-xs font-bold text-gray-500 px-2 mb-2">{new Date(article.publishedAt).toLocaleString().split(',')[0]}</p>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {visibleCount < 20 && articles.length > visibleCount && (
        <div className="mt-4 text-center">
          <button
            onClick={handleShowMore}
            className="px-4 py-2 bg-green-400 text-white rounded-[10px] hover:bg-green-500"
          >
            Show More
          </button>
        </div>
      )}
    </section>
  );
}

export default NewsPage;
