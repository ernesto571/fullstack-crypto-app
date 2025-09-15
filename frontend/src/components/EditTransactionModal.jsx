import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const EditTransactionModal = ({ isOpen, onClose, transaction, onSuccess }) => {
  const [formData, setFormData] = useState({
    coinId: "",
    coinName: "",
    coinSymbol: "",
    coinImage: "",
    quantity: "",
    price: "",
    date: "",
    type: "buy",
  });
  const [loading, setLoading] = useState(false);
  const [useMarketPrice, setUseMarketPrice] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        coinId: transaction.coinId || "",
        coinName: transaction.coinName || "",
        coinSymbol: transaction.coinSymbol || "",
        coinImage: transaction.coinImage || "",
        quantity: transaction.totalQuantity || "",
        price: transaction.avgCost || "",
        date: transaction.date ? transaction.date.split("T")[0] : "",
        type: transaction.type || "buy",
      });
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchMarketPrice = async () => {
    try {
      if (!formData.coinId) {
        toast.error("Coin ID missing");
        return;
      }

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${formData.coinId}&vs_currencies=usd`
      );
      const data = await res.json();

      if (!data[formData.coinId]?.usd) {
        throw new Error("No price data available");
      }

      setFormData((prev) => ({ ...prev, price: data[formData.coinId].usd }));
      setUseMarketPrice(true);
      toast.success("Market price applied");
    } catch (error) {
      console.error("Error fetching market price:", error);
      toast.error("Failed to fetch market price");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!transaction?._id) {
      toast.error("Invalid transaction");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.put(
        `/portfolio/transaction/${transaction._id}`,
        {
          coinId: formData.coinId,
          coinName: formData.coinName,
          coinSymbol: formData.coinSymbol,
          coinImage: formData.coinImage,
          quantity: parseFloat(formData.quantity),
          pricePerCoin: parseFloat(formData.price),
          date: formData.date,
          type: formData.type,
        }
      );

      toast.success("Transaction updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating transaction:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 outline-none focus:border-1 focus:border-green-500"
              step="any"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  justify-between ">
              <span>Price</span>
              <button
                type="button"
                onClick={fetchMarketPrice}
                className="text-xs text-green-500 hover:underline ml-5"
              >
                Use Market Price
              </button>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 outline-none focus:border-1 focus:border-green-500"
              step="any"
              required
              disabled={useMarketPrice}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2  outline-none focus:border-1 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2  outline-none focus:border-1 focus:border-green-500"
              required
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
