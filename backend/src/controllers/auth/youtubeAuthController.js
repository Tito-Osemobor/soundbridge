const {youtubeLoginService, youtubeCallbackService} = require("../../services/auth/youtubeAuthService");
const {generateToken, setAuthCookie} = require("../../services/auth/authService");

const youtubeLogin = async (req, res, next) => {
  try {
    const loginUrl = youtubeLoginService();
    res.redirect(loginUrl);
  } catch (error) {
    next(error);
  }
};

// 🔹 Connect YouTube to an existing user account
const youtubeConnect = async (req, res, next) => {
  try {
    const loginUrl = youtubeLoginService(); // Get YouTube OAuth login URL
    const connectUrl = `${loginUrl}&state=connect`; // Append `state=connect`
    res.redirect(connectUrl); // Redirect user to YouTube for approval
  } catch (error) {
    next(error);
  }
};

const youtubeCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const isConnect = state === "connect"; // 🔹 Check if this is a "connect" request

    // If the user is connecting an account, extract user ID from JWT
    const existingUserId = isConnect ? req.user.userId : null;

    const userId = await youtubeCallbackService(code, existingUserId);

    if (isConnect) {
      res.json({ success: true, message: "YouTube account connected"});
    } else {
      // 🔹 Generate JWT for first-time logins
      const token = generateToken(userId);
      setAuthCookie(res, token);
      res.json({ success: true, message: "YouTube login successful", userId });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { youtubeLogin, youtubeCallback, youtubeConnect };
