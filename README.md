# 💰 CoinRadar  

**CoinRadar** is a full-stack MERN cryptocurrency tracking platform that lets users monitor market trends, view real-time data from [CoinGecko](https://www.coingecko.com/), and read the latest crypto news powered by [NewsAPI.org](https://newsapi.org/).  
It features secure authentication, personalized watchlists, a user profile system with Cloudinary image uploads, and a clean, responsive dashboard for seamless portfolio tracking.  

---

## 🚀 Features  

- 🔐 **User Authentication**  
  JWT-based signup, login, and logout functionality for secure access.  
  Built with Node.js and Express authentication routes.  

- 👤 **User Profile**  
  Each user has a personal profile page where they can update details and upload a **profile picture**.  
  Images are securely stored and delivered via **Cloudinary**.  

- 🪙 **Live Crypto Data**  
  Frontend directly fetches real-time market data, trending coins, top gainers, and losers from **CoinGecko API**.  

- 🗞️ **Crypto News Section**  
  Fetches and displays current cryptocurrency news articles via **NewsAPI.org** for up-to-date insights.  

- 📊 **Portfolio & Watchlist Management**  
  Logged-in users can add coins to their **personal watchlist** or **portfolio** for easy tracking.  

- 🔍 **Search Functionality**  
  Quickly search for coins by name or symbol and view full details, including price changes, charts, and volume data.  

- ⚙️ **Smart API Layer**  
  Includes built-in rate-limit handling and caching for CoinGecko API calls using Axios interceptors and TTL-based cache.  

- 🌙 **Modern UI/UX**  
  Built with React + Tailwind CSS for a fast, minimal, and mobile-friendly interface.  

---

## 🧰 Tech Stack  

### Frontend  
- React (Vite)  
- Tailwind CSS  
- Axios  
- Zustand (State Management)  
- React Hot Toast  

### Backend  
- Node.js + Express  
- MongoDB + Mongoose  
- JSON Web Token (JWT)  
- bcrypt.js  
- Cloudinary SDK  

---

## ⚡️ Getting Started  

### Prerequisites  
- Node.js (v18+)  
- MongoDB (local or Atlas)  
- CoinGecko API key ([get one here](https://www.coingecko.com/en/api))  
- NewsAPI API key ([get one here](https://newsapi.org/))  
- Cloudinary account ([sign up free](https://cloudinary.com/))  

---

### 🔧 Installation  

#### 1. Clone the repository  
```bash
git clone https://github.com/yourusername/coinradar.git
cd coinradar
```

#### 2. Install dependencies  
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Create environment variables  

**Backend (.env):**  
```
PORT=5001
MONGO_URI=your_mongo_connection_string
NODE_ENV=development
JWT_SECRET=your_secret_key
NEWS_API_KEY=your_newsapi_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**  
```
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_NEWS_API_KEY=your_newsapi_key
VITE_BACKEND_URL=http://localhost:5001
```

---

### ▶️ Run the App  

#### Backend:  
```bash
cd backend
npm run dev
```

#### Frontend:  
```bash
cd frontend
npm run dev
```

Then open your browser at **http://localhost:5173**  

---

## 🌍 Deployment  

You can deploy the backend to **Render**, **Railway**, or **Vercel**, and host the frontend on **Vercel** or **Netlify**.  

**Tips:**  
- Use `https` for production.  
- Set proper CORS and cookie settings for auth.  
- Keep your API keys secure in environment variables.  

---

## 🧠 Project Structure  

```
coinradar/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   └── vite.config.js
│
└── README.md
```

---

## 🧩 API Endpoints  

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Log in an existing user |
| `POST` | `/api/auth/logout` | Log out a user |
| `GET` | `/api/auth/check` | Verify authentication token |
| `GET` | `/api/users/profile` | Fetch current user's profile |
| `PUT` | `/api/users/profile` | Update profile details or upload photo |
| `GET` | `/api/watchlist` | Get user's watchlist |
| `POST` | `/api/watchlist` | Add coin to watchlist |
| `DELETE` | `/api/watchlist/:id` | Remove coin from watchlist |
| `GET` | `/api/portfolio` | Fetch user's portfolio |
| `POST` | `/api/portfolio` | Add coin to portfolio |
| `GET` | `/api/news` | Fetch crypto news from NewsAPI |

---

## 💡 Future Enhancements  

- Google OAuth integration  
- Advanced portfolio analytics (profit/loss tracking)  
- Dark/light theme toggle  
- Real-time WebSocket price updates  
- AI-powered sentiment analysis for news  

---

## 🧑‍💻 Author  

**Emmanuel Cruz**  
Full-stack Developer  
[GitHub](https://github.com/ernesto571) | [LinkedIn](https://linkedin.com/in/yourprofile)
