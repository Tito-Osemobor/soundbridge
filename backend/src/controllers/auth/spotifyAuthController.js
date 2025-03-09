const {spotifyLoginService, spotifyCallbackService} = require("../../services/auth/spotifyAuthService");

const spotifyLogin = async (req, res, next) => {
  try {
    const loginUrl = spotifyLoginService();
    res.redirect(loginUrl);
  } catch (error) {
    next(error);
  }
};

const spotifyCallback = async (req, res, next) => {
  try {
    const { accessToken } = await spotifyCallbackService(req.query.code);
    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { spotifyLogin, spotifyCallback };
