const {youtubeLoginService, youtubeCallbackService} = require("../../services/auth/youtubeAuthService");
const {generateToken, setAuthCookie, setSessionCookie} = require("../../services/auth/authService");
const {saveTemporarySession, generateSessionId, deleteSession, getSessionFromDatabase} = require("../../services/auth/sessionService");
const {session} = require("@prisma/client");

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
    const userId = req.user?.userId; // ✅ User is authenticated via JWT
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const sessionId = generateSessionId();  // 🔹 Generate session ID

    // 🔹 Capture user's IP and User-Agent
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // 🔹 Save the session
    await saveTemporarySession(sessionId, userId, "youtube", ipAddress, userAgent);

    // 🔹 Store session ID in a cookie (as a backup)
    setSessionCookie(res, sessionId);

    // 🔹 Redirect user to YouTube OAuth
    res.redirect(youtubeLoginService());
  } catch (error) {
    next(error);
  }
};

const youtubeCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, message: "Authorization code missing" });

    // 🔹 Try to get session ID from cookie first
    let sessionId = req.cookies?.sessionId;

    // 🔹 If cookie is missing, find session by matching IP & User-Agent
    if (!sessionId) {
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      const latestSession = await session.findFirst({
        where: {
          provider: "youtube",
          ipAddress,
          userAgent,
        },
        orderBy: { createdAt: "desc" },
      });

      sessionId = latestSession?.sessionId;
    }

    if (!sessionId) return res.status(401).json({ success: false, message: "Session expired or missing" });

    // 🔹 Retrieve user from session
    const session = await getSessionFromDatabase(sessionId);
    if (!session) return res.status(401).json({ success: false, message: "Invalid session" });

    const userId = session.userId;

    // 🔹 Exchange YouTube auth code for access token and save it in DB
    await youtubeCallbackService(code, userId);

    // 🔹 Delete session after use (security best practice)
    await deleteSession(sessionId);

    res.json({ success: true, message: "YouTube account connected", userId});
  } catch (error) {
    next(error);
  }
};

module.exports = { youtubeLogin, youtubeCallback, youtubeConnect };
