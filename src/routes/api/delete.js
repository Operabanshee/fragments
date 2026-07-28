const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure the fragment exists and belongs to the current user.
    await Fragment.byId(req.user, id);
    await Fragment.delete(req.user, id);

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json(createErrorResponse(404, err.message));
    }

    return next(err);
  }
};
