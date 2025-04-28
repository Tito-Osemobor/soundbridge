import {
  registerUser,
  verifyUserCredentials,
  generateToken,
  setAuthCookie,
  fetchUserProfile
} from "../services/auth/authService.js";
import {NODE_ENV} from "../config/applicationConfig.js";

export const register = async (req, res, next) => {
  try {
    console.log("📝 Registering user...");

    const {email, password, reEnterPassword} = req.body;
    if (password !== reEnterPassword) {
      console.warn("⚠️ Passwords do not match.");
      return res.status(200).json({ success: false, message: "Passwords do not match" });
    }

    const user = await registerUser(email, password);
    console.log("✅ User registered:", user);

    const token = generateToken(user.userId);
    console.log("🔑 Generated token:", token);

    setAuthCookie(res, token);
    console.log("🍪 Token set in cookie.");

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log("🔐 Logging in user...");

    const {email, password} = req.body;
    const user = await verifyUserCredentials(email, password);
    console.log("✅ User verified:", user);

    if (!user) {
      console.warn("⚠️ Invalid login attempt.");
      return res.status(200).json({ success: false, message: "Invalid email or password" }); // ✅ Return JSON instead of throwing
    }

    const token = generateToken(user.userId);
    console.log("🔑 Generated token:", token);

    setAuthCookie(res, token);
    console.log("🍪 Token set in cookie.");

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    next(error);
  }
};

export const logout = (req, res) => {
  try {
    console.log("🚪 Logging out user...");

    res.clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "Strict",
    });

    console.log("🧹 Cleared auth token cookie.");
    return res.status(200).json({success: true, message: "Logged out successfully"});
  } catch (error) {
    console.error("❌ Logout Error:", error);
    return res.status(500).json({success: false, message: "Logout failed"});
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    console.log("👤 Fetching user profile...");

    const userId = req.user?.userId;
    if (!userId) {
      console.warn("⚠️ Unauthorized request - No user ID found.");
      return res.status(200).json(null); // ✅ Return null instead of 401
    }

    const userProfile = await fetchUserProfile(userId);
    console.log(`✅ Fetched user profile for userId ${userId}:`, userProfile);

    res.json(userProfile);
  } catch (error) {
    console.error("❌ Get User Profile Error:", error);
    next(error);
  }
};
