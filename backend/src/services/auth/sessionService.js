const { prisma } = require("../../services/db");
const crypto = require("crypto");

// 🔹 Generate a random session ID
const generateSessionId = () => crypto.randomBytes(32).toString("hex");

// 🔹 Save session to database with expiration
const saveTemporarySession = async (sessionId, userId, provider, ipAddress, userAgent) => {
  return prisma.session.create({
    data: {
      sessionId,
      userId,
      provider,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 🔹 Expires in 10 minutes
    },
  });
};

// 🔹 Retrieve session from database
const getSessionFromDatabase = async (sessionId) => {
  return prisma.session.findUnique({
    where: {sessionId},
  });
};

// 🔹 Delete session after use (for security)
const deleteSession = async (sessionId) => {
  return prisma.session.delete({
    where: {sessionId},
  });
};

module.exports = {
  generateSessionId,
  saveTemporarySession,
  getSessionFromDatabase,
  deleteSession,
};
