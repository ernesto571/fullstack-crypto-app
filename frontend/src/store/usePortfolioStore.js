// Add these functions to your existing services/Api.js file

const API_BASE_URL = 'https://fullstack-crypto-app.onrender.com/api';

// Portfolio API functions
export const portfolioApi = {
  // Get portfolio summary and holdings
  getPortfolio: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  // Add a new transaction
  addTransaction: async (transactionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/transaction`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Get all transactions with pagination
  getTransactions: async (page = 1, limit = 50, coinId = null) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (coinId) {
        params.append('coinId', coinId);
      }

      const response = await fetch(`${API_BASE_URL}/portfolio/transactions?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Update a transaction
  updateTransaction: async (transactionId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/transaction/${transactionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (transactionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/transaction/${transactionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};

// Alternative: Individual named exports (use either this OR the object above)
export const getPortfolio = portfolioApi.getPortfolio;
export const addTransaction = portfolioApi.addTransaction;
export const getTransactions = portfolioApi.getTransactions;
export const updateTransaction = portfolioApi.updateTransaction;
export const deleteTransaction = portfolioApi.deleteTransaction;