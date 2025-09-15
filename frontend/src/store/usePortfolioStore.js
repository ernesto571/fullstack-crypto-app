// services/Api.js
import { axiosInstance } from "../lib/axios.js"; // make sure axiosInstance has withCredentials: true

// Portfolio API functions
export const portfolioApi = {
  // Get portfolio summary and holdings
  getPortfolio: async () => {
    try {
      const { data } = await axiosInstance.get("/portfolio");
      return data;
    } catch (error) {
      console.error("Error fetching portfolio:", error.response?.data || error.message);
      throw error;
    }
  },

  // Add a new transaction
  addTransaction: async (transactionData) => {
    try {
      const { data } = await axiosInstance.post("/portfolio/transaction", transactionData);
      return data;
    } catch (error) {
      console.error("Error adding transaction:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get all transactions with pagination
  getTransactions: async (page = 1, limit = 50, coinId = null) => {
    try {
      const params = { page, limit };
      if (coinId) params.coinId = coinId;

      const { data } = await axiosInstance.get("/portfolio/transactions", { params });
      return data;
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update a transaction
  updateTransaction: async (transactionId, updateData) => {
    try {
      const { data } = await axiosInstance.put(`/portfolio/transaction/${transactionId}`, updateData);
      return data;
    } catch (error) {
      console.error("Error updating transaction:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (transactionId) => {
    try {
      const { data } = await axiosInstance.delete(`/portfolio/transaction/${transactionId}`);
      return data;
    } catch (error) {
      console.error("Error deleting transaction:", error.response?.data || error.message);
      throw error;
    }
  }
};

// Optional: individual named exports
export const getPortfolio = portfolioApi.getPortfolio;
export const addTransaction = portfolioApi.addTransaction;
export const getTransactions = portfolioApi.getTransactions;
export const updateTransaction = portfolioApi.updateTransaction;
export const deleteTransaction = portfolioApi.deleteTransaction;
