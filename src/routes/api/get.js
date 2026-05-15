/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    fragments: [],
    user: req.user || null,
    authenticated: typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false,
  });
};
