import Footer from "../components/Footer"
import Header from "../components/Header"
import NewsCard from "../components/NewsPageCard"

function NewsPage(){

    return(
        <div className="mt-[49px]">
            <Header/>
            
            <div className="w-[96%] ml-[2%]">
                <NewsCard/>
            </div>

            <Footer/>
        
        </div>
    )

}
export default NewsPage