const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 votes per windowMs
  message: {
    error: 'Too many votes from this IP, please try again later.'
  }
});

const pollCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each user to 5 polls per hour
  message: {
    error: 'Too many polls created, please try again later.'
  }
});

module.exports = { voteLimiter, pollCreationLimiter };