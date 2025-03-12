const {
  registerUser,
  verifyUserCredentials,
  generateToken,
  setAuthCookie,
  fetchUserProfile
} = require("../../services/auth/authService");
const {BadRequestError} = require("../../utils/error");

const register = async (req, res, next) => {
  try {
    console.log("📝 Registering user...");

    const {email, password, reEnterPassword} = req.body;
    if (password !== reEnterPassword) {
      console.warn("⚠️ Passwords do not match.");
      throw new BadRequestError("Passwords do not match");
    }

    const user = await registerUser(email, password);
    console.log("✅ User registered:", user);

    const token = generateToken(user.userId);
    console.log("🔑 Generated token:", token);

    setAuthCookie(res, token);
    console.log("🍪 Token set in cookie.");

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log("🔐 Logging in user...");

    const {email, password} = req.body;
    const user = await verifyUserCredentials(email, password);
    console.log("✅ User verified:", user);

    const token = generateToken(user.userId);
    console.log("🔑 Generated token:", token);

    setAuthCookie(res, token);
    console.log("🍪 Token set in cookie.");

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    next(error);
  }
};

const logout = (req, res) => {
  try {
    console.log("🚪 Logging out user...");

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PROD",
      sameSite: "Strict",
    });

    console.log("🧹 Cleared auth token cookie.");
    return res.status(200).json({success: true, message: "Logged out successfully"});
  } catch (error) {
    console.error("❌ Logout Error:", error);
    return res.status(500).json({success: false, message: "Logout failed"});
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    console.log("👤 Fetching user profile...");

    const userId = req.user?.userId;
    if (!userId) {
      console.warn("⚠️ Unauthorized request - No user ID found.");
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const userProfile = await fetchUserProfile(userId);
    console.log(`✅ Fetched user profile for userId ${userId}:`, userProfile);

    res.json(userProfile);
  } catch (error) {
    console.error("❌ Get User Profile Error:", error);
    next(error);
  }
};

module.exports = {register, login, logout, getUserProfile};
