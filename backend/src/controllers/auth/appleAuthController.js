const {appleLoginService, appleCallbackService} = require("../../services/auth/appleAuthService");
const {generateToken, setAuthCookie} = require("../../services/auth/authService");

const appleLogin = async (req, res, next) => {
  try {
    const loginUrl = appleLoginService();
    res.redirect(loginUrl);
  } catch (error) {
    next(error);
  }
};

const appleCallback = async (req, res, next) => {
  try {
    const { userId, accessToken } = await appleCallbackService(req.body);

    // Generate JWT and set in cookie
    const token = generateToken(userId);
    setAuthCookie(res, token);

    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { appleLogin, appleCallback };
