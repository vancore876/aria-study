module.exports = {
  // Security headers configuration
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        childSrc: ["'none'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"]
      }
    },
    xssProtection: true,
    frameOptions: { action: 'deny' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicyReportOnly: false
  },
  
  // CSRF configuration
  csrf: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000 // 24 hours
    }
  },
  
  // Rate limiting configuration
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many login attempts. Please try again later.'
    },
    api: {
      windowMs: 60 * 60 * 1000,
      max: 1000,
      message: 'Too many requests. Please try again later.'
    }
  }
};
