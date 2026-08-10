const express = require('express');
const contentType = require('content-type');

const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

// Support sending supported Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

module.exports = [
  rawBody(),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body)) {
        return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
      }

      const { id } = req.params;
      const { type } = contentType.parse(req);
      const fragment = await Fragment.byId(req.user, id);

      if (fragment.mimeType !== type) {
        return res
          .status(400)
          .json(createErrorResponse(400, `existing fragment type is ${fragment.mimeType}`));
      }

      await fragment.setData(req.body);

      return res.status(200).json(createSuccessResponse({ fragment }));
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json(createErrorResponse(404, err.message));
      }

      return next(err);
    }
  },
];
