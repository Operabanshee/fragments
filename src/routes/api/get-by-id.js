const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const { id, ext } = req.params;
    const fragment = await Fragment.byId(req.user, id);

    if (ext && ext !== 'txt') {
      return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
    }

    const data = await fragment.getData();
    res.setHeader('Content-Type', `${fragment.mimeType}; charset=utf-8`);
    res.status(200).send(data);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json(createErrorResponse(404, err.message));
    }

    next(err);
  }
};
