const {youtubeLoginService, youtubeCallbackService} = require("../../services/auth/youtubeAuthService");

const youtubeLogin = async (req, res, next) => {
  try {
    const loginUrl = youtubeLoginService();
    res.redirect(loginUrl);
  } catch (error) {
    next(error);
  }
};

const youtubeCallback = async (req, res, next) => {
  try {
    const { accessToken } = await youtubeCallbackService(req.body);
    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { youtubeLogin, youtubeCallback };
