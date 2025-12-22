const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Call next() after successfully setting req.user
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) { // Check if req.user exists before accessing role
    return res.status(403).json({ message: "Access Denied" });
  }
  next();
};

module.exports = { protect, authorize };
