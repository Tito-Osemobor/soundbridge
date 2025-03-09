const {spotifyLoginService, spotifyCallbackService} = require("../../services/auth/spotifyAuthService");
const {generateToken, setAuthCookie} = require("../../services/auth/authService");

const spotifyLogin = async (req, res, next) => {
  try {
    const loginUrl = spotifyLoginService();
    res.redirect(loginUrl);
  } catch (error) {
    next(error);
  }
};

// 🔹 Connect Spotify to an existing user account
const spotifyConnect = async (req, res, next) => {
  try {
    const loginUrl = spotifyLoginService(); // Get Spotify OAuth login URL
    const connectUrl = `${loginUrl}&state=connect`; // Append `state=connect`
    res.redirect(connectUrl); // Redirect user to Spotify for approval
  } catch (error) {
    next(error);
  }
};

const spotifyCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const isConnect = state === "connect"; // 🔹 Check if this is a "connect" request

    // If the user is connecting an account, extract user ID from JWT
    const existingUserId = isConnect ? req.user.userId : null;

    const userId = await spotifyCallbackService(code, existingUserId);

    if (isConnect) {
      res.json({ success: true, message: "Spotify account connected"});
    } else {
      // 🔹 Generate JWT for first-time logins
      const token = generateToken(userId);
      setAuthCookie(res, token);
      res.json({ success: true, message: "Spotify login successful", userId });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {spotifyLogin, spotifyCallback, spotifyConnect};
