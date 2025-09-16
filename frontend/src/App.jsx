import Navbar from "./components/Navbar"
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";


import { useAuthStore } from "./store/useAuthStore";
// import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import TrendingPage from "./pages/TrendingPage";
import TopGainer from "./pages/TopGainerPage";
import Highlights from "./pages/HighlightsPage";
import HighVolume from "./pages/HighVolume";
import SearchResults from "./pages/SearchResultsPage";
import CoinDetails from "./pages/CoinDetailsPage";
import NewsPage from "./pages/NewsPage";
import PortfolioPage from "./pages/PortfolioPage";
import WatchlistPage from "./pages/Watchlist";
import ProfilePage from "./pages/ProfilePage"
import NotFound from "./pages/NotFoundPage";


function App() {

  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div>
      <Navbar/>

      <Routes>
      <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Navigate to="/cryptocurrency" />} />
      <Route path="/cryptocurrency" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/cryptocurrency" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/cryptocurrency" />} />
        <Route path="/trending-crypto" element={authUser ? <TrendingPage /> : <Navigate to="/login" />} />
        <Route path="/top-gainers_losers" element={authUser ? <TopGainer /> : <Navigate to="/login" />} />
        <Route path="/highlights" element={authUser ? <Highlights /> : <Navigate to="/login" />} />
        <Route path="/high-volume" element={authUser ? <HighVolume /> : <Navigate to="/login" />} />
        <Route path="/cryptocurrency/search" element={authUser ? <SearchResults /> : <Navigate to="/login" />}/>
        <Route path="/cryptocurrency/:id" element={authUser ? <CoinDetails /> : <Navigate to="/login" />}/>
        <Route path="/cryptocurrency/news" element={authUser ? <NewsPage /> : <Navigate to="/login" />}/>
        <Route path="/watchlist" element={authUser ? <WatchlistPage /> : <Navigate to="/login" />} />
        <Route path="/portfolio" element={authUser ? <PortfolioPage/> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />

    </div>
  )
}

export default App
