// src/modules/admin/campaignsController.js
// Manage campaigns scheduling, linked to segments. No email delivery yet.

const { Campaign, Segment } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

function deriveStatus(c) {
  const now = new Date();
  const starts = c.startsAt ? new Date(c.startsAt) : null;
  const ends = c.endsAt ? new Date(c.endsAt) : null;
  if (c.status === 'paused') return 'paused';
  if (c.status === 'draft') return 'draft';
  if (starts && now < starts) return 'scheduled';
  if (starts && (!ends || now <= ends)) return 'running';
  if (ends && now > ends) return 'finished';
  return c.status || 'draft';
}

exports.list = async (_req, res, next) => {
  try {
    const campaigns = await Campaign.findAll({ order: [['id', 'DESC']], include: [{ model: Segment }] });
    const data = campaigns.map((c) => ({
      ...c.toJSON(),
      currentStatus: deriveStatus(c),
    }));
    res.json(data);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const name = (req.body?.name || '').toString().trim();
    if (!name) throw new ApiError('name is required', 400);
    const segmentId = parseInt(req.body?.segmentId, 10);
    if (isNaN(segmentId)) throw new ApiError('segmentId is required', 400);
    const couponCode = req.body?.couponCode ? String(req.body.couponCode).trim() : null;
    const startsAt = req.body?.startsAt ? new Date(req.body.startsAt) : null;
    const endsAt = req.body?.endsAt ? new Date(req.body.endsAt) : null;
    let status = req.body?.status || 'draft';
    if (status !== 'paused' && status !== 'draft') {
      // auto-derive from dates
      status = deriveStatus({ startsAt, endsAt, status: 'draft' });
    }
    const c = await Campaign.create({ name, segmentId, couponCode, startsAt, endsAt, status });
    res.status(201).json({ ...c.toJSON(), currentStatus: deriveStatus(c) });
  } catch (err) { next(err); }
};

