import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token;

      if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
      }

    // 3. Filtered cookies (e.g., tokens stored under a custom name)
    else if (req.cookies) {
      const allowedCookieNames = ["jwt", "auth_token", "session_id"]; // ✅ whitelist
      const foundKey = Object.keys(req.cookies).find((key) =>
        allowedCookieNames.includes(key)
      );
      if (foundKey) {
        token = req.cookies[foundKey];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // ✅ attach user to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};
