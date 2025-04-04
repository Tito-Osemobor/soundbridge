const {Platform} = require("@prisma/client");
const {spotifyCallbackService} = require("../../services/auth/spotifyAuthService");
const {youtubeCallbackService} = require("../../services/auth/youtubeAuthService");
const {spotifyLoginService} = require("../../services/auth/spotifyAuthService");
const {youtubeLoginService} = require("../../services/auth/youtubeAuthService");
const {
  generateSessionId,
  saveTemporarySession,
  getSessionFromDatabase,
  deleteSession
} = require("../../services/auth/sessionService");
const {setSessionCookie} = require("../../services/auth/authService");
const {prisma} = require("../../services/db");

const handlePlatformConnect = async (req, res, next) => {
  const platformId = req.query.platformId;
  const userId = req.user?.userId;

  if (!platformId) {
    return res.status(400).json({success: false, message: "Missing platform parameter"});
  }

  if (!userId) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }

  try {
    const sessionId = generateSessionId();
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    await saveTemporarySession(sessionId, userId, platformId, ipAddress, userAgent);
    setSessionCookie(res, sessionId);

    let loginUrl;

    switch (platformId) {
      case Platform.SPOTIFY:
        loginUrl = spotifyLoginService();
        break;
      case Platform.YOUTUBE_MUSIC:
        loginUrl = `${youtubeLoginService()}&state=connect`;
        break;
      default:
        return res.status(400).json({success: false, message: "Unsupported platform"});
    }

    console.log(`🔹 Redirecting to ${platformId} for connect:`, loginUrl);
    return res.json({success: true, redirectUrl: loginUrl});
  } catch (err) {
    next(err);
  }
};

const handlePlatformCallback = async (req, res, next) => {
  const platformId = req.params.platformId;
  const {code, state} = req.query;

  if (!platformId || !code) {
    return res.status(400).json({success: false, message: "Missing platform or code"});
  }

  if (state !== "connect") {
    return res.status(400).json({success: false, message: "Invalid state"});
  }

  try {
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    let sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      const latestSession = await prisma.session.findFirst({
        where: {platform: platformId, ipAddress, userAgent},
        orderBy: {createdAt: "desc"},
      });

      sessionId = latestSession?.sessionId;
    }

    if (!sessionId) return res.status(401).json({success: false, message: "Session expired or missing"});

    const session = await getSessionFromDatabase(sessionId);
    if (!session) return res.status(401).json({success: false, message: "Invalid session"});

    const userId = session.userId;

    switch (platformId) {
      case Platform.SPOTIFY:
        await spotifyCallbackService(code, userId);
        break;
      case Platform.YOUTUBE_MUSIC:
        await youtubeCallbackService(code, userId);
        break;
      default:
        return res.status(400).json({success: false, message: "Unsupported platform"});
    }

    await deleteSession(sessionId);

    console.log(`✅ ${platformId} connected successfully.`);
    return res.redirect(`${process.env.FRONTEND_DEV_URL}/oauth?platformId=${platformId}&success=true`);
  } catch (error) {
    console.error("OAuth callback failed:", error);
    return res.redirect(`${process.env.FRONTEND_DEV_URL}/oauth?platformId=${platformId || "unknown"}&success=false&error=${encodeURIComponent(error.message)}`);
  }
};

module.exports = {
  handlePlatformConnect,
  handlePlatformCallback,
};
