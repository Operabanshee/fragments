const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');
const sharp = require('sharp');

const md = new MarkdownIt();
const imageExtToFormat = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
};
const imageFormatToMime = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

module.exports = async (req, res, next) => {
  try {
    const { id, ext } = req.params;
    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (!ext) {
      if (fragment.isText || fragment.mimeType === 'application/json') {
        res.setHeader('Content-Type', `${fragment.mimeType}; charset=utf-8`);
      } else {
        res.setHeader('Content-Type', fragment.mimeType);
      }
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

    if (fragment.mimeType.startsWith('image/')) {
      const normalizedExt = ext.toLowerCase();
      const targetFormat = imageExtToFormat[normalizedExt];

      if (targetFormat) {
        const converted = await sharp(data).toFormat(targetFormat).toBuffer();
        res.setHeader('Content-Type', imageFormatToMime[targetFormat]);
        return res.status(200).send(converted);
      }
    }

    return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json(createErrorResponse(404, err.message));
    }

    next(err);
  }
};
