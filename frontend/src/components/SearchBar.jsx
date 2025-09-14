import { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchCoins } from "../services/Api";

// ✅ Reusable SearchBar component
function SearchBar({ className }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced fetch suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const results = await searchCoins(query);
        setSuggestions(results.slice(0, 10));
        setShowDropdown(true);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/cryptocurrency/search?coin=${query.toLowerCase()}`);
    setShowDropdown(false);
  };

  const handleSuggestionClick = (coinId) => {
    navigate(`/cryptocurrency/${coinId}`);
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
          size={20}
        />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
          className="pl-10 my-1 w-full bg-[#f1f5f9] pr-3 py-1.5 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white relative z-10"
        />
      </form>
      
      {/* Suggestions Dropdown with fixed positioning */}
      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="fixed bg-white shadow-lg rounded-lg border max-h-60 overflow-y-auto z-[60]"
          style={{
            top: searchRef.current?.getBoundingClientRect().bottom + window.scrollY + 4,
            left: searchRef.current?.getBoundingClientRect().left + window.scrollX,
            width: searchRef.current?.getBoundingClientRect().width,
          }}
        >
          <ul>
            {suggestions.map((coin) => (
              <li
                key={coin.id}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent form submit on click
                  handleSuggestionClick(coin.id);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
              >
                <img src={coin.thumb} alt={coin.name} className="w-5 h-5" />
                <span className="font-medium">{coin.name}</span>
                <span className="text-gray-500 text-xs uppercase">
                  {coin.symbol}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar;