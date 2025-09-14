import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'   // ✅ Tailwind included here
import { BrowserRouter } from 'react-router-dom'
import { WatchlistProvider } from './contexts/WatchlistContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <WatchlistProvider>
      <App />
    </WatchlistProvider>
    </BrowserRouter>
  </React.StrictMode>
)
