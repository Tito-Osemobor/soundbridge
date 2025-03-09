const {appleLoginService, appleCallbackService} = require("../../services/auth/appleAuthService");

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
    const { accessToken } = await appleCallbackService(req.body);
    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { appleLogin, appleCallback };
