const jwt = require("jsonwebtoken");

// Function to generate JWT token
function generateToken(user) {
  const payload = {
    userId: user._id, // Ensure this matches the field name in your schema
    role: user.role
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded; // Decoded token payload must include _id
    console.log("Token:", token);
    console.log("Decoded user:", decoded);

    next();
  });
}

// Middleware to check if the authenticated user is an admin
function isAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
}

module.exports = { authenticateToken, isAdmin };
