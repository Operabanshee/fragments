/**
 * Get a list of fragments for the current user
 */
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const expand = req.query.expand === '1' || req.query.expand === 'true';
    const fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    next(err);
  }
};
