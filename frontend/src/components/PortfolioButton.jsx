import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import toast from 'react-hot-toast';

const AddToPortfolioButton = ({ coin }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Pre-populate the modal with coin data and current price
  const handleAddToPortfolio = () => {
    setShowAddModal(true);
  };

  const handleSuccess = () => {
    setShowAddModal(false);
    toast.success(`Added ${coin.name} to portfolio!`);
    // You might want to update some parent state here too
  };

  return (
    <>
      <button 
        onClick={handleAddToPortfolio}
        className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 my-3 ml-3"
      >
        <Plus size={16} />
        Add to Portfolio –{" "}
        {coin.watchlist_portfolio_users ? 
          coin.watchlist_portfolio_users.toLocaleString() : 
          '0'
        } added
      </button>

      {/* Transaction Modal with pre-populated data */}
      <AddTransactionModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSuccess}
        preFilledCoin={{
          coinId: coin.id,
          coinName: coin.name,
          coinSymbol: coin.symbol,
          coinImage: coin.image?.thumb || coin.image,
          currentPrice: coin.current_price
        }}
      />
    </>
  );
};

export default AddToPortfolioButton;