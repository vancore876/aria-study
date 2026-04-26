const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const { v4: uuidv4 } = require('uuid');

// Rate limiting for brute force protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts. Please try again later.'
});

const csrfProtection = csrf({ cookie: true });

// Secure headers middleware
const secureHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  next();
};

// Session regeneration middleware
const regenerateSession = async (req, res, next) => {
  if (req.session && !req.session.regenerated) {
    const newSessionId = uuidv4();
    await req.sessionStore.destroy(req.session.id);
    req.session.id = newSessionId;
    req.session.regenerated = true;
  }
  next();
};

module.exports = {
  loginLimiter,
  csrfProtection,
  secureHeaders,
  regenerateSession
};
