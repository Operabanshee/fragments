const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

module.exports = async (req, res, next) => {
  try {
    const { id, ext } = req.params;
    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (!ext) {
      res.setHeader('Content-Type', `${fragment.mimeType}; charset=utf-8`);
      return res.status(200).send(data);
    }

    if (ext === 'txt' && fragment.mimeType === 'text/plain') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(data);
    }

    if (ext === 'html' && fragment.mimeType === 'text/markdown') {
      const rendered = md.render(data.toString());
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(rendered);
    }

    return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json(createErrorResponse(404, err.message));
    }

    next(err);
  }
};
