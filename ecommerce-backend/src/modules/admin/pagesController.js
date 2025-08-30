const { Op } = require('sequelize');
const { Page } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

function normalize(body) {
  const slug = String(body?.slug || '').trim().toLowerCase();
  const title = String(body?.title || '').trim();
  const bodyText = String(body?.body || '').trim();
  const publishedAt = body?.publishedAt ? new Date(body.publishedAt) : null;
  return { slug, title, body: bodyText, publishedAt };
}

function validate(p) {
  if (!p.slug) throw new ApiError('slug is required', 400);
  if (!/^[a-z0-9\-]+$/.test(p.slug)) throw new ApiError('slug must be kebab-case [a-z0-9-]', 400);
  if (!p.title) throw new ApiError('title is required', 400);
  if (!p.body) throw new ApiError('body is required', 400);
}

exports.list = async (_req, res, next) => {
  try {
    const pages = await Page.findAll({ order: [['id','DESC']] });
    res.json(pages);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = normalize(req.body || {});
    validate(data);
    const exists = await Page.findOne({ where: { slug: data.slug } });
    if (exists) throw new ApiError('slug already exists', 400);
    const rec = await Page.create(data);
    res.status(201).json(rec);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const page = await Page.findByPk(id);
    if (!page) throw new ApiError('not found', 404);
    const data = normalize(req.body || {});
    if (req.body?.slug) validate({ ...page.toJSON(), ...data });
    if (data.slug && data.slug !== page.slug) {
      const exists = await Page.findOne({ where: { slug: data.slug, id: { [Op.ne]: id } } });
      if (exists) throw new ApiError('slug already exists', 400);
    }
    Object.assign(page, data);
    await page.save();
    res.json(page);
  } catch (err) { next(err); }
};

