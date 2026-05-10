const jwtUtils = require('../utils/jwt');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    console.log(`[AUTH] Checking auth for: ${req.method} ${req.originalUrl}`);
    const auth = req.headers.authorization;
    if (!auth) {
      console.log(`[AUTH] ERROR: No Authorization header`);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log(`[AUTH] ERROR: Invalid auth format`);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = parts[1];
    const payload = jwtUtils.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      console.log(`[AUTH] ERROR: User not found for token`);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    console.log(`[AUTH] SUCCESS: User ${user.email} authenticated`);
    next();
  } catch (err) {
    console.log(`[AUTH] ERROR: ${err.message}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
