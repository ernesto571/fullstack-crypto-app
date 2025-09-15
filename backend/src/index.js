import express from "express"
import authRoutes from "../routes/auth.route.js"
import dotenv from "dotenv"
import connectDB from "../lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors";
import newsRoutes from "../routes/news.route.js";
import watchlistRoutes from "../routes/watchlist.route.js";
import portfolioRoutes from "../routes/portfolio.route.js";
import path from "path"


dotenv.config()
const PORT = process.env.PORT
const __dirname = path.resolve()


const app = express()
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser())

app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

app.use("/api/auth", authRoutes)
app.use("/api/news", newsRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/portfolio", portfolioRoutes);


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () =>{
    console.log("server is running on port ", PORT)
    connectDB()

})