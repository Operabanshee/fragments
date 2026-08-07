const express = require('express');
const { hostname } = require('os');

// Our authentication middleware
const { authenticate } = require('../auth');
const { createErrorResponse, createSuccessResponse } = require('../response');

// version and author from package.json
const { version, author } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  next();
};

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), requireAuth, require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json(
    createSuccessResponse({
      description: 'fragments service running normally',
      author,
      githubUrl: 'https://github.com/operabanshee/fragments',
      version,
      timestamp: new Date().toISOString(),
      hostname: hostname(),
      uptime: Math.floor(process.uptime()),
    })
  );
});

module.exports = router;
