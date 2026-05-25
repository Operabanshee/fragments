/**
 * Get a list of fragments for the current user
 */
const { createSuccessResponse } = require('../../response');

module.exports = (req, res) => {
  res.status(200).json(createSuccessResponse({
    fragments: [],
    user: req.user || null,
    authenticated: typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false,
  }));
};
