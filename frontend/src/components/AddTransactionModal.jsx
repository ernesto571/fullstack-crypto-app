import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { searchCoins } from '../services/Api';
import toast from 'react-hot-toast';
import axios from 'axios';

function AddTransactionModal({ isOpen, onClose, onSuccess, preFilledCoin = null }) {
  const [formData, setFormData] = useState({
    coinId: '',
    coinName: '',
    coinSymbol: '',
    coinImage: '',
    type: 'buy',
    quantity: '',
    pricePerCoin: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [coinSearch, setCoinSearch] = useState('');
  const [coinSuggestions, setCoinSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const searchRef = useRef(null);

  // Search for coins
  useEffect(() => {
    if (!coinSearch.trim()) {
      setCoinSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const results = await searchCoins(coinSearch);
        setCoinSuggestions(results.slice(0, 10));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching coins:', error);
        setCoinSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [coinSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form when modal closes or pre-fill with coin data
  useEffect(() => {
    if (isOpen && preFilledCoin) {
      setFormData({
        coinId: preFilledCoin.coinId,
        coinName: preFilledCoin.coinName,
        coinSymbol: preFilledCoin.coinSymbol,
        coinImage: preFilledCoin.coinImage,
        type: 'buy',
        quantity: '',
        pricePerCoin: preFilledCoin.currentPrice?.toString() || '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setCoinSearch(preFilledCoin.coinName);
      setShowSuggestions(false);
    } else if (!isOpen) {
      setFormData({
        coinId: '',
        coinName: '',
        coinSymbol: '',
        coinImage: '',
        type: 'buy',
        quantity: '',
        pricePerCoin: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setCoinSearch('');
      setCoinSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOpen, preFilledCoin]);

  const handleCoinSelect = (coin) => {
    setFormData({
      ...formData,
      coinId: coin.id,
      coinName: coin.name,
      coinSymbol: coin.symbol,
      coinImage: coin.thumb
    });
    setCoinSearch(coin.name);
    setShowSuggestions(false);
  };

  // Fetch real market price for selected coin
  const fetchMarketPrice = async () => {
    if (!formData.coinId) {
      toast.error('Please select a coin first');
      return;
    }

    try {
      setFetchingPrice(true);
      const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(formData.coinId)}&vs_currencies=usd`);
      const price = data[formData.coinId]?.usd;

      if (!price && price !== 0) {
        throw new Error('Price not available');
      }

      setFormData(prev => ({ ...prev, pricePerCoin: price?.toString() || '' }));
      toast.success('Market price applied');
    } catch (error) {
      console.error('Error fetching market price:', error);
      toast.error('Failed to fetch market price');
    } finally {
      setFetchingPrice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.coinId || !formData.quantity || !formData.pricePerCoin) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (parseFloat(formData.pricePerCoin) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setLoading(true);
    
    try {
      const { data } = await axios.post('http://localhost:5001/api/portfolio/transaction', {
        coinId: formData.coinId,
        coinName: formData.coinName,
        coinSymbol: formData.coinSymbol,
        coinImage: formData.coinImage,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        pricePerCoin: parseFloat(formData.pricePerCoin),
        date: formData.date,
        notes: formData.notes
      }, { withCredentials: true });

      toast.success(`${formData.type === 'buy' ? 'Buy' : 'Sell'} transaction added successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Error adding transaction:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formData.quantity && formData.pricePerCoin 
    ? (parseFloat(formData.quantity) * parseFloat(formData.pricePerCoin)).toFixed(2)
    : '0.00';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="buy"
                  checked={formData.type === 'buy'}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mr-2 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Buy</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="sell"
                  checked={formData.type === 'sell'}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mr-2 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Sell</span>
              </label>
            </div>
          </div>

          {/* Coin Search */}
          <div className="relative" ref={searchRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cryptocurrency <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={coinSearch}
                onChange={(e) => setCoinSearch(e.target.value)}
                onFocus={() => coinSuggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search for a cryptocurrency..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            {/* Coin Suggestions */}
            {showSuggestions && coinSuggestions.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white shadow-lg rounded-lg border max-h-40 overflow-y-auto z-10">
                {coinSuggestions.map((coin) => (
                  <div
                    key={coin.id}
                    onClick={() => handleCoinSelect(coin)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <img src={coin.thumb} alt={coin.name} className="w-5 h-5 rounded-full" />
                    <span className="font-medium text-gray-900">{coin.name}</span>
                    <span className="text-gray-500 text-sm uppercase ml-auto">{coin.symbol}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Selected coin display */}
            {formData.coinId && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                <img src={formData.coinImage} alt={formData.coinName} className="w-5 h-5 rounded-full" />
                <span className="text-sm font-medium text-gray-900">{formData.coinName}</span>
                <span className="text-sm text-gray-500">({formData.coinSymbol.toUpperCase()})</span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.000001"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="0.00000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          {/* Price Per Coin with "Use Market Price" button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Coin (USD) <span className="text-red-500">*</span>
            </label>
            <div className="block lg:flex md:flex gap-2">
              <input
                type="number"
                step="any"
                min="0.000001"
                value={formData.pricePerCoin}
                onChange={(e) => setFormData({...formData, pricePerCoin: e.target.value})}
                placeholder="0.00"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <button
                type="button"
                onClick={fetchMarketPrice}
                disabled={fetchingPrice || !formData.coinId}
                className="px-3 py-2 my-2 md:my-0 lg:my-0 rounded-lg border border-gray-300 bg-green-500 hover:bg-green-600 text-white font-semibold  disabled:opacity-50"
              >
                {fetchingPrice ? 'Fetching...' : 'Use Market Price'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">Click <strong>Use Market Price</strong> to auto-fill the current USD price from CoinGecko.</div>
          </div>

          {/* Total Amount Display */}
          <div className={`p-3 rounded-lg ${formData.type === 'buy' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className={`text-lg font-bold ${formData.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                ${totalAmount}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formData.type === 'buy' ? 'Amount you will spend' : 'Amount you will receive'}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any notes about this transaction..."
              rows="3"
              maxLength="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.notes.length}/500 characters
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.coinId}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.type === 'buy' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                `${formData.type === 'buy' ? 'Buy' : 'Sell'} ${formData.coinSymbol.toUpperCase() || 'Asset'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
