import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw
} from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { axiosInstance } from '../lib/axios';

const PortfolioPage = () => {
  const [showValues, setShowValues] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [portfolio, setPortfolio] = useState({
    holdings: [],
    summary: {
      totalValue: 0,
      totalCostBasis: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      dayChange: 0,
      dayChangePercentage: 0
    }
  });

  // Fetch portfolio data - now relies entirely on backend calculations
  const fetchPortfolio = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axiosInstance.get("/portfolio");
      
      // Validate the data structure
      if (data && typeof data === 'object') {
        setPortfolio({
          holdings: Array.isArray(data.holdings) ? data.holdings : [],
          summary: {
            totalValue: parseFloat(data.summary?.totalValue || 0),
            totalCostBasis: parseFloat(data.summary?.totalCostBasis || 0),
            totalPnL: parseFloat(data.summary?.totalPnL || 0),
            totalPnLPercentage: parseFloat(data.summary?.totalPnLPercentage || 0),
            dayChange: parseFloat(data.summary?.dayChange || 0),
            dayChangePercentage: parseFloat(data.summary?.dayChangePercentage || 0)
          }
        });
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid portfolio data received');
      }

    } catch (error) {
      console.error("Error fetching portfolio:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.error || 
        "Failed to load portfolio data. Please try again."
      );
      
      // Keep existing data on error instead of resetting
      if (portfolio.holdings.length === 0) {
        setPortfolio({
          holdings: [],
          summary: {
            totalValue: 0,
            totalCostBasis: 0,
            totalPnL: 0,
            totalPnLPercentage: 0,
            dayChange: 0,
            dayChangePercentage: 0
          }
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await axiosInstance.delete(`/portfolio/transaction/${transactionId}`);
      toast.success("Transaction deleted successfully");
      fetchPortfolio(true); // Refresh data
    } catch (error) {
      console.error("Error deleting transaction:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to delete transaction");
    }
  };

  // Refresh prices manually
  const refreshPrices = () => {
    fetchPortfolio(true);
    toast.success("Refreshing portfolio data...");
  };

  // Load portfolio on component mount
  useEffect(() => {
    fetchPortfolio();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchPortfolio(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Utility functions
  const formatCurrency = (amount, decimals = 2) => {
    if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '—';
    
    return showValues
      ? `$${numAmount.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: decimals 
        })}`
      : '****';
  };

  const formatNumber = (num, decimals = 6) => {
    if (num === null || num === undefined || Number.isNaN(num)) return '—';
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return '—';
    
    return showValues 
      ? numValue.toLocaleString(undefined, { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: decimals 
        }) 
      : '****';
  };

  const formatPercentage = (percent) => {
    if (percent === null || percent === undefined || Number.isNaN(percent)) return '—';
    const numPercent = parseFloat(percent);
    if (isNaN(numPercent)) return '—';
    
    return showValues ? `${numPercent.toFixed(2)}%` : '****';
  };

  // Calculate additional stats
  const portfolioStats = {
    diversityCount: portfolio.holdings.length,
    topHolding: portfolio.holdings.reduce((max, holding) => 
      parseFloat(holding.currentValue || 0) > parseFloat(max?.currentValue || 0) ? holding : max, null
    ),
    topHoldingPercentage: portfolio.summary.totalValue > 0 && portfolio.holdings.length > 0 
      ? ((portfolio.holdings.reduce((max, holding) => 
          parseFloat(holding.currentValue || 0) > parseFloat(max?.currentValue || 0) ? holding : max, null
        )?.currentValue || 0) / portfolio.summary.totalValue * 100)
      : 0
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6 pt-[49px] pb-20">
        <Header/>
        
        {/* Header */}
        <div className="w-[94%] mx-auto md:flex lg:flex block justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600 mt-1">Track your cryptocurrency investments</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-3 md:mt-0 lg:mt-0">
            <button
              onClick={refreshPrices}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setShowValues(!showValues)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {showValues ? <Eye size={16} /> : <EyeOff size={16} />}
              {showValues ? 'Hide' : 'Show'}
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              <Plus size={16} />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-[94%] mx-auto">
          {/* Total Portfolio Value */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Portfolio Value</h3>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.summary.totalValue)}
            </div>
            <div className={`flex items-center mt-2 text-sm ${
              portfolio.summary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolio.summary.dayChange >= 0 ? 
                <ArrowUpRight size={14} className="mr-1" /> : 
                <ArrowDownRight size={14} className="mr-1" />
              }
              {showValues ? `${formatCurrency(Math.abs(portfolio.summary.dayChange))} (${formatPercentage(Math.abs(portfolio.summary.dayChangePercentage))})` : '****'}
              <span className="text-gray-500 ml-1">24h</span>
            </div>
          </div>

          {/* Total P&L */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total P&L</h3>
              {portfolio.summary.totalPnL >= 0 ? 
                <TrendingUp className="w-4 h-4 text-green-500" /> : 
                <TrendingDown className="w-4 h-4 text-red-500" />
              }
            </div>
            <div className={`text-2xl font-bold ${
              portfolio.summary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {showValues ? 
                `${portfolio.summary.totalPnL >= 0 ? '+' : ''}${formatCurrency(portfolio.summary.totalPnL)}` : 
                '****'
              }
            </div>
            <div className={`text-sm mt-2 ${
              portfolio.summary.totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {showValues ? 
                `${portfolio.summary.totalPnLPercentage >= 0 ? '+' : ''}${formatPercentage(portfolio.summary.totalPnLPercentage)}` : 
                '****'
              } from cost basis
            </div>
          </div>

          {/* Total Cost Basis */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Cost Basis</h3>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.summary.totalCostBasis)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Average cost of holdings
            </div>
          </div>

          {/* Top Holding */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Top Holding</h3>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {portfolioStats.topHolding ? portfolioStats.topHolding.coinName : 'N/A'}
            </div>
            <div className="text-sm text-green-600 mt-2">
              {portfolioStats.topHolding && showValues ? 
                `${formatPercentage(portfolioStats.topHoldingPercentage)} of portfolio` : 
                showValues ? 'No data' : '****'
              }
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-[94%] mx-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Holdings</h2>
                <p className="text-gray-600 text-sm mt-1">{portfolio.holdings.length} assets</p>
              </div>
              {refreshing && (
                <div className="flex items-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating prices...
                </div>
              )}
            </div>
          </div>

          {portfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 sticky left-0 z-50 bg-gray-50">Asset</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Avg Cost</th>
                    <th className="px-6 py-3">Current Price</th>
                    <th className="px-6 py-3">Market Value</th>
                    <th className="px-6 py-3">Cost Basis</th>
                    <th className="px-6 py-3">P&L</th>
                    <th className="px-6 py-3">24h Change</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>

<tbody className="bg-white divide-y divide-gray-200">
  {portfolio.holdings.map((holding) => (
    <tr key={holding.coinId} className="hover:bg-gray-50 transition-colors">
      {/* Asset */}
      <td className="pl-6 pr-10 py-4 whitespace-nowrap sticky left-0 bg-white hover:bg-gray-50 transition-colors z-50 shadow-sm">
        <div className="flex items-center">
          <img
            src={holding.coinImage}
            alt={holding.coinName}
            className="w-8 h-8 rounded-full mr-3"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/32/cccccc/ffffff?text=' + holding.coinSymbol?.charAt(0);
            }}
          />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {holding.coinName}
            </div>
            <div className="text-sm text-gray-500">
              {holding.coinSymbol?.toUpperCase()}
            </div>
          </div>
        </div>
      </td>
      
      {/* Quantity */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatNumber(holding.totalQuantity, 8)}
      </td>
      
      {/* Avg Cost */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(holding.avgCost, 6)}
      </td>
      
      {/* Current Price */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(holding.currentPrice, 6)}
      </td>
      
      {/* Market Value */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {formatCurrency(holding.currentValue)}
      </td>
      
      {/* Cost Basis */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(holding.totalCostBasis)}
      </td>
      
      {/* P&L */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className={`${parseFloat(holding.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <div className="font-medium">
            {showValues ? 
              `${parseFloat(holding.pnl || 0) >= 0 ? '+' : ''}${formatCurrency(holding.pnl)}` : 
              '****'
            }
          </div>
          <div className="text-xs">
            {showValues ? 
              `${parseFloat(holding.pnlPercentage || 0) >= 0 ? '+' : ''}${formatPercentage(holding.pnlPercentage)}` : 
              '****'
            }
          </div>
        </div>
      </td>
      
      {/* 24h Change */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className={`${parseFloat(holding.dayChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <div className="flex items-center">
            {parseFloat(holding.dayChange || 0) >= 0 ? 
              <ArrowUpRight size={12} className="mr-1" /> : 
              <ArrowDownRight size={12} className="mr-1" />
            }
            {showValues ? formatCurrency(Math.abs(parseFloat(holding.dayChange || 0))) : '****'}
          </div>
          <div className="text-xs">
            {showValues ? formatPercentage(Math.abs(parseFloat(holding.dayChangePercentage || 0))) : '****'}
          </div>
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <button
            className="text-gray-400 hover:text-gray-600 transition"
            onClick={() => {
              if (holding.transactions && holding.transactions.length > 0) {
                setSelectedTransaction(holding.transactions[0]);
                setShowEditModal(true);
              } else {
                toast.error("No transactions available for editing");
              }
            }}
          >
            <Edit3 size={16} />
          </button>
          <button
            className="text-gray-400 hover:text-red-600 transition"
            onClick={() => {
              if (holding.transactions && holding.transactions.length > 0) {
                deleteTransaction(holding.transactions[0]._id);
              } else {
                toast.error("No transactions available for deletion");
              }
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-12">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No holdings yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first transaction to start tracking your portfolio
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Add Transaction
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-[94%] mx-auto">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Portfolio Diversity</h3>
            <div className="text-xl font-bold text-gray-900">{portfolioStats.diversityCount} Assets</div>
            <div className="text-sm text-gray-500">Across cryptocurrencies</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Top Holding</h3>
            <div className="text-xl font-bold text-gray-900">
              {portfolioStats.topHolding ? portfolioStats.topHolding.coinName : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              {portfolioStats.topHolding && showValues ? 
                `${portfolioStats.topHoldingPercentage.toFixed(1)}% of portfolio` : 
                showValues ? 'No data' : '****'
              }
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Last Updated</h3>
            <div className="text-xl font-bold text-gray-900">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
            </div>
            <div className="text-sm text-gray-500">
              {refreshing ? 'Updating...' : 'Real-time prices'}
            </div>
          </div>
        </div>

        {/* Add Transaction Modal */}
        <AddTransactionModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchPortfolio(true); // Refresh portfolio data
            setShowAddModal(false);
          }}
        />

        {/* Edit Transaction Modal */}
        <EditTransactionModal
          isOpen={showEditModal}
          transaction={selectedTransaction}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchPortfolio(true); // Refresh portfolio data
            setShowEditModal(false);
          }}
        />

      </div>
      <Footer/>
    </div>
  );
};

export default PortfolioPage;