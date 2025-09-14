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
  Loader2
} from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import Header from '../components/Header';

const PortfolioPage = () => {
  const [showValues, setShowValues] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/portfolio', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const data = await response.json();
      // set portfolio first
      setPortfolio(data);

      // then fetch market prices for holdings (if any)
      if (data.holdings && data.holdings.length > 0) {
        fetchCurrentMarketPrices(data.holdings);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current prices from CoinGecko for a list of holdings and update state
  const fetchCurrentMarketPrices = async (holdings) => {
    try {
      const ids = holdings
        .map(h => h.coinId)
        .filter(Boolean)
        .join(',');

      if (!ids) return;

      // include 24h change
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
      const resp = await fetch(url);
      const priceData = await resp.json();

      // map updated holdings
      const updatedHoldings = holdings.map(h => {
        const coinPriceObj = priceData[h.coinId];
        if (!coinPriceObj) return h;

        const currentPrice = typeof coinPriceObj.usd === 'number' ? coinPriceObj.usd : parseFloat(coinPriceObj.usd);
        const dayChangePercent = typeof coinPriceObj.usd_24h_change === 'number' ? coinPriceObj.usd_24h_change : parseFloat(coinPriceObj.usd_24h_change || 0);
        const totalQty = parseFloat(h.totalQuantity || 0);
        const currentValue = Number((currentPrice * totalQty) || 0);
        const dayChange = Number((currentValue * (dayChangePercent / 100)) || 0);

        return {
          ...h,
          currentPrice,
          currentValue,
          dayChange,
          dayChangePercentage: dayChangePercent
        };
      });

      setPortfolio(prev => ({ ...prev, holdings: updatedHoldings }));
    } catch (error) {
      console.error('Failed to fetch market prices:', error);
      // silent: not critical, but notify
      toast.error('Could not fetch live market prices');
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/portfolio/transaction/${transactionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      toast.success('Transaction deleted successfully');
      fetchPortfolio(); // Refresh data
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Load portfolio on component mount
  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount, decimals = 6) => {
    if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
    return showValues
      ? `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`
      : '****';
  };

  const formatNumber = (num, decimals = 6) => {
    if (num === null || num === undefined || Number.isNaN(num)) return '—';
    return showValues ? Number(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals }) : '****';
  };

  const formatPercentage = (percent) => {
    if (percent === null || percent === undefined || Number.isNaN(percent)) return '—';
    return showValues ? `${Number(percent).toFixed(2)}%` : '****';
  };

  // Calculate additional stats (simple, uses server summary if provided)
  const portfolioStats = {
    diversityCount: portfolio.holdings.length,
    topHolding: portfolio.holdings.reduce((max, holding) => 
      holding.currentValue > (max?.currentValue || 0) ? holding : max, null
    ),
    topHoldingPercentage: portfolio.summary.totalValue > 0 && portfolio.holdings.length > 0 
      ? ((portfolio.holdings.reduce((max, holding) => 
          holding.currentValue > (max?.currentValue || 0) ? holding : max, null
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

    <div className=" space-y-6 pt-[49px] pb-20">

      <Header/>
      {/* Header */}
      <div className="w-[94%] mx-auto md:flex lg:flex block justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600 mt-1">Track your cryptocurrency investments</p>
        </div>
        <div className="flex items-center gap-3 mt-3 md:mt-0 lg:mt-0">
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

        {/* Portfolio Diversity */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Best Performer</h3>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {portfolioStats.topHolding ? portfolioStats.topHolding.coinName : 'N/A'}
          </div>
          <div className="text-sm text-green-600 mt-2">
            {portfolioStats.topHolding && showValues ? 
              `+${formatPercentage(portfolioStats.topHolding.pnlPercentage)} P&L` : 
              showValues ? 'No data' : '****'
            }
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-[94%] mx-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Holdings</h2>
          <p className="text-gray-600 text-sm mt-1">{portfolio.holdings.length} assets</p>
        </div>

        {portfolio.holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Asset</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={holding.coinImage}
                          alt={holding.coinName}
                          className="w-8 h-8 rounded-full mr-3"
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
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(holding.totalQuantity)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.avgCost)}
                    </td>
                    
                    {/* Real market price (fetched from CoinGecko on load) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(holding.currentValue)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.totalCostBasis)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="font-medium">
                          {showValues ? 
                            `${holding.pnl >= 0 ? '+' : ''}${formatCurrency(holding.pnl)}` : 
                            '****'
                          }
                        </div>
                        <div className="text-xs">
                          {showValues ? 
                            `${holding.pnlPercentage >= 0 ? '+' : ''}${formatPercentage(holding.pnlPercentage)}` : 
                            '****'
                          }
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`${holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center">
                          {holding.dayChange >= 0 ? 
                            <ArrowUpRight size={12} className="mr-1" /> : 
                            <ArrowDownRight size={12} className="mr-1" />
                          }
                          {showValues ? formatCurrency(Math.abs(holding.dayChange)) : '****'}
                        </div>
                        <div className="text-xs">
                          {showValues ? formatPercentage(Math.abs(holding.dayChangePercentage)) : '****'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-gray-400 hover:text-gray-600 transition"
                          onClick={() => {
                            if (holding.transactions?.length > 0) {
                              setSelectedTransaction(holding.transactions[0]); // pick first transaction
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
                            if (holding.transactions?.length > 0) {
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
          <div className="text-xl font-bold text-gray-900">Just now</div>
          <div className="text-sm text-gray-500">Real-time prices</div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchPortfolio(); // Refresh portfolio data
          setShowAddModal(false);
        }}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={showEditModal}
        transaction={selectedTransaction}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          fetchPortfolio(); // Refresh portfolio data
          setShowEditModal(false);
        }}
      />

    </div>
    <Footer/>

    </div>

  );
};

export default PortfolioPage;
