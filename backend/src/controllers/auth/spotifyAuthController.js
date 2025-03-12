const {spotifyLoginService, spotifyCallbackService} = require("../../services/auth/spotifyAuthService");
const {
  generateSessionId, saveTemporarySession, getSessionFromDatabase, deleteSession
} = require("../../services/auth/sessionService");
const {setSessionCookie} = require("../../services/auth/authService");
const {Platform} = require("@prisma/client");
const {prisma} = require("../../services/db");

// 🔹 Connect Spotify to an existing user account
const spotifyConnect = async (req, res, next) => {
  try {
    const userId = req.user?.userId; // ✅ User is authenticated via JWT
    if (!userId) return res.status(401).json({success: false, message: "Unauthorized"});

    const sessionId = generateSessionId();  // 🔹 Generate session ID

    // 🔹 Capture user's IP and User-Agent
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // 🔹 Save the session
    await saveTemporarySession(sessionId, userId, Platform.SPOTIFY, ipAddress, userAgent);

    // 🔹 Store session ID in a cookie (as a backup)
    setSessionCookie(res, sessionId);

    // 🔹 Redirect to Spotify for account linking
    const loginUrl = spotifyLoginService();
    console.log("🔹 Redirecting to Spotify for connect:", loginUrl);

    res.json({success: true, redirectUrl: loginUrl});
  } catch (error) {
    next(error);
  }
};

const spotifyCallback = async (req, res, next) => {
  try {
    console.log("🔹 Received Spotify callback with:", req.query);
    const {code, state} = req.query;

    if (!code) return res.status(400).json({success: false, message: "Authorization code missing"});

    if (state !== "connect") {
      return res.status(400).json({success: false, message: "Invalid state for account linking"});
    }

    let sessionId = req.cookies?.sessionId;
    let userId = null;

    if (!sessionId) {
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      const latestSession = await prisma.session.findFirst({
        where: {platform: Platform.SPOTIFY, ipAddress, userAgent}, orderBy: {createdAt: "desc"},
      });

      sessionId = latestSession?.sessionId;
    }

    if (!sessionId) {
      return res.status(401).json({success: false, message: "Session expired or missing"});
    }

    const session = await getSessionFromDatabase(sessionId);
    if (!session) return res.status(401).json({success: false, message: "Invalid session"});

    userId = session.userId;

    // 🔹 Exchange Spotify auth code for tokens and link account
    await spotifyCallbackService(code, userId);

    // 🔹 Delete session after use
    if (sessionId) {
      await deleteSession(sessionId);
    }

    console.log("✅ Spotify account connected successfully.");
    return res.send(`
      <script>
        window.opener.postMessage({ success: true }, "*");
        window.close();
      </script>
    `);
  } catch (error) {
    console.error("❌ Spotify Callback Error:", error);
    next(error);
  }
};

module.exports = {spotifyCallback, spotifyConnect};
