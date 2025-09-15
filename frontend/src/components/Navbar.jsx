import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, BarChart3,  User, Newspaper, Star, Briefcase, LayoutDashboardIcon } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-40 backdrop-blur-lg bg-white/80">
        <div className="container min-w-[96%] ml-[2%] h-12">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/cryptocurrency" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">CoinRadar</h1>
              </Link>
            </div>

            {/* Middle Navigation - Hide on small screens */}
            {authUser && (
              <div className="hidden md:flex gap-3">
                <Link
                  to="/cryptocurrency/news"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <Newspaper className="w-4 h-4" />
                  News
                </Link>

                <Link
                  to="/watchlist"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <Star className="w-4 h-4" />
                  Watchlist
                </Link>

                <Link
                  to="/portfolio"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <Briefcase className="w-4 h-4" />
                  Portfolio
                </Link>
              </div>
            )}

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              

              {authUser && (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:flex lg:flex">Profile</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="flex items-center  px-3 py-1.5  rounded-md border border-red-300 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden md:flex lg:flex">Logout</span>

                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Show only on small screens */}
      {authUser && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
          <div className="px-4 py-1">
            <div className="flex justify-around gap-1">
              <Link
                to="/cryptocurrency"
                className="flex flex-col items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition min-w-0"
              >
                <LayoutDashboardIcon className="w-5 h-5" />
                <span className="truncate">Dashboard</span>
              </Link>
              <Link
                to="/cryptocurrency/news"
                className="flex flex-col items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition min-w-0"
              >
                <Newspaper className="w-5 h-5" />
                <span className="truncate">News</span>
              </Link>
              <Link
                to="/watchlist"
                className="flex flex-col items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition min-w-0"
              >
                <Star className="w-5 h-5" />
                <span className="truncate">Watchlist</span>
              </Link>
              <Link
                to="/portfolio"
                className="flex flex-col items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition min-w-0"
              >
                <Briefcase className="w-5 h-5" />
                <span className="truncate">Portfolio</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;