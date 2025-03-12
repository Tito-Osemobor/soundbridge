const {youtubeLoginService, youtubeCallbackService} = require("../../services/auth/youtubeAuthService");
const {
  saveTemporarySession,
  generateSessionId,
  deleteSession,
  getSessionFromDatabase
} = require("../../services/auth/sessionService");
const {setSessionCookie, generateToken, setAuthCookie} = require("../../services/auth/authService");
const {Platform} = require("@prisma/client");
const {prisma} = require("../../services/db");


// 🔹 Connect YouTube to an existing user account
const youtubeConnect = async (req, res, next) => {
  try {
    const userId = req.user?.userId; // ✅ User is authenticated via JWT
    if (!userId) return res.status(401).json({success: false, message: "Unauthorized"});

    const sessionId = generateSessionId();  // 🔹 Generate session ID

    // 🔹 Capture user's IP and User-Agent
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // 🔹 Save the session
    await saveTemporarySession(sessionId, userId, Platform.YOUTUBE_MUSIC, ipAddress, userAgent);

    // 🔹 Store session ID in a cookie (as a backup)
    setSessionCookie(res, sessionId);

    // 🔹 Redirect user to YouTube OAuth
    const loginUrl = `${youtubeLoginService()}&state=connect`;
    console.log("🔹 Redirecting to YouTube for connect:", loginUrl);

    res.json({success: true, redirectUrl: loginUrl});
  } catch (error) {
    next(error);
  }
};

const youtubeCallback = async (req, res, next) => {
  try {
    console.log("🔹 Received YouTube callback with:", req.query);
    const {code, state} = req.query;

    if (!code) return res.status(400).json({success: false, message: "Authorization code missing"});

    let userId = null;
    let sessionId = req.cookies?.sessionId;

    if (state === "connect") {
      if (!sessionId) {
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
        const userAgent = req.headers["user-agent"] || "unknown";

        const latestSession = await prisma.session.findFirst({
          where: {platform: Platform.YOUTUBE_MUSIC, ipAddress, userAgent},
          orderBy: {createdAt: "desc"},
        });

        sessionId = latestSession?.sessionId;
      }

      if (!sessionId) return res.status(401).json({success: false, message: "Session expired or missing"});

      // 🔹 Retrieve user from session
      const session = await getSessionFromDatabase(sessionId);
      if (!session) return res.status(401).json({success: false, message: "Invalid session"});

      userId = session.userId;
    }

    await youtubeCallbackService(code, userId);

    if (sessionId) await deleteSession(sessionId);

    console.log("✅ YouTube connected successfully.");
    return res.send(`
      <script>
        window.opener.postMessage({ success: true }, "*");
        window.close();
      </script>
    `);
  } catch (error) {
    console.error("❌ YouTube Callback Error:", error);
    next(error);
  }
};

module.exports = {youtubeCallback, youtubeConnect};
