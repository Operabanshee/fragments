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

      const { type } = contentType.parse(req);
      const fragment = new Fragment({
        ownerId: req.user,
        type,
        size: 0,
      });

      await fragment.save();
      await fragment.setData(req.body);

      const apiUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
      res
        .location(new URL(`/v1/fragments/${fragment.id}`, apiUrl).toString())
        .status(201)
        .json(createSuccessResponse({ fragment }));
    } catch (err) {
      next(err);
    }
  },
];
