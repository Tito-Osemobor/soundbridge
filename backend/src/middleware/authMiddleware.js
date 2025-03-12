const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({success: false, message: "Unauthorized: No token provided"});
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // Attach user data to the request
    next();
  } catch (error) {
    return res.status(403).json({success: false, message: "Unauthorized: Invalid token"});
  }
};

module.exports = authenticate;
