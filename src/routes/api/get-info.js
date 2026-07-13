const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fragment = await Fragment.byId(req.user, id);

    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json(createErrorResponse(404, err.message));
    }

    next(err);
  }
};
