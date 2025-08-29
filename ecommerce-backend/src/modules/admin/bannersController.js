const { Op } = require('sequelize');
const { Banner } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

function normalize(body) {
  const title = String(body?.title || '').trim();
  const imageUrl = String(body?.imageUrl || '').trim();
  const linkUrl = body?.linkUrl ? String(body.linkUrl).trim() : null;
  const placement = String(body?.placement || '').trim();
  const isActive = body?.isActive === false ? false : true;
  const startsAt = body?.startsAt ? new Date(body.startsAt) : null;
  const endsAt = body?.endsAt ? new Date(body.endsAt) : null;
  return { title, imageUrl, linkUrl, placement, isActive, startsAt, endsAt };
}

function validate(b) {
  if (!b.title) throw new ApiError('title is required', 400);
  if (!b.imageUrl) throw new ApiError('imageUrl is required', 400);
  if (!['home-hero','rail','sidebar'].includes(b.placement)) throw new ApiError('invalid placement', 400);
  if (b.startsAt && b.endsAt && new Date(b.startsAt) > new Date(b.endsAt)) throw new ApiError('startsAt must be <= endsAt', 400);
}

exports.list = async (_req, res, next) => {
  try {
    const list = await Banner.findAll({ order: [['id','DESC']] });
    res.json(list);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = normalize(req.body || {});
    validate(data);
    const record = await Banner.create(data);
    res.status(201).json(record);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const banner = await Banner.findByPk(id);
    if (!banner) throw new ApiError('not found', 404);
    const data = normalize(req.body || {});
    if (req.body?.placement) validate({ ...banner.toJSON(), ...data });
    Object.assign(banner, data);
    await banner.save();
    res.json(banner);
  } catch (err) { next(err); }
};

