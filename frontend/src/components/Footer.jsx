import toast from "react-hot-toast"


function Footer(){

    const handleClick = (e)=>{
        e.preventDefault()
        toast.success("Subscribed")
    }

    return(
        <div className="max-w-[94%] ml-[3%] mt-8 mb-[70px]">
            <div className="border-t-[1px] border-b-[1px] border-solid border-[#eff2f5] block  lg:flex pt-5 pb-5 justify-between">
                <div className="w-[100%] text-[0.9rem] md:text-base lg:textbase">
                    <p className="text-gray-700 mt-4.5 font-semibold mb-2.5 ">Interested to stay up-to-date with cryptocurrencies?</p>
                    <p className="text-gray-500 font-semibold">Get the latest crypto news, updates, and reports by subscribing to our free newsletter.</p>
                </div>
                <form action="" className="gap-2 mr-[4%] grid  lg:flex mt-4 md:mt-6 lg:mt-0 " >
                    <input type="email" placeholder="Enter your email address" className="border-[2px] border-solid border-[#eff2f5] rounded-[15px] px-6 h-[50px] focus:border-[2px] focus:border-solid focus:border-[#008000f1] outline-none" required/>
                    <button className="bg-[#a4e57e] rounded-[15px] px-3 text-white font-bold h-[50px] " onClick={handleClick}>Subscribe</button>
                </form>
            </div>

            <p className="text-gray-500 py-5 text-[0.9rem] md:text-base lg:text-base  font-semibold ">© 2025 CoinRadar. All Rights Reserved</p>

            <p className="text-gray-500 py-5 text-[0.9rem] md:text-base lg:text-base  mb-3"><strong className="text-gray-700 underline">IMPORTANT DISCLAIMER:</strong> All content provided herein our website, hyperlinked sites, associated applications, forums, blogs, social media accounts and other platforms (“Site”) is for your general information only, procured from third party sources. We make no warranties of any kind in relation to our content, including but not limited to accuracy and updatedness. No part of the content that we provide constitutes financial advice, legal advice or any other form of advice meant for your specific reliance for any purpose. Any use or reliance on our content is solely at your own risk and discretion. You should conduct your own research, review, analyse and verify our content before relying on them. Trading is a highly risky activity that can lead to major losses, please therefore consult your financial advisor before making any decision. No content on our Site is meant to be a solicitation or offer. Data from CoinGecko API.</p>
        </div>
    )
}
export default Footer