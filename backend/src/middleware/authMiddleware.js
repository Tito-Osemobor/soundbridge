import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../config/applicationConfig.js";

const authenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  console.log("🔍 Checking authentication for:", req.originalUrl); // Debugging log

  if (!token) {
    if (req.originalUrl === "/auth/me") { // ✅ Ensure proper path matching
      return res.status(200).json(null); // Gracefully handle missing token for /auth/me
    }
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    console.warn("⚠️ Invalid token:", error.message);

    if (req.originalUrl === "/auth/me") {
      return res.status(200).json(null); // ✅ Ensure /auth/me doesn't throw an error
    }

    return res.status(403).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

export default authenticate;
