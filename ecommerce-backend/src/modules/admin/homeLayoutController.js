const { Op } = require('sequelize');
const { HomeLayout, AdminAuditLog } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

async function latestVersion() {
  const row = await HomeLayout.findOne({ attributes: ['version'], order: [['version', 'DESC']] });
  return row ? row.version : 0;
}

exports.get = async (_req, res, next) => {
  try {
    const [latestDraft, latestPublished] = await Promise.all([
      HomeLayout.findOne({ where: { publishedAt: { [Op.is]: null } }, order: [['version','DESC'],['id','DESC']] }),
      HomeLayout.findOne({ where: { publishedAt: { [Op.not]: null } }, order: [['version','DESC'],['id','DESC']] }),
    ]);
    res.json({ latestDraft, latestPublished });
  } catch (err) { next(err); }
};

exports.save = async (req, res, next) => {
  const t = await HomeLayout.sequelize.transaction();
  try {
    const json = req.body?.json;
    if (!json || typeof json !== 'object') throw new ApiError('json layout required', 400);
    const publish = !!req.body?.publish;
    const v = 1 + await latestVersion();
    const record = await HomeLayout.create({ json, version: v, publishedAt: publish ? new Date() : null }, { transaction: t });
    try { await AdminAuditLog.create({ adminUserId: req.user?.id || null, action: publish ? 'home_layout.publish' : 'home_layout.save', detail: { version: v } }, { transaction: t }); } catch {}
    await t.commit();
    res.status(201).json(record);
  } catch (err) { await t.rollback(); next(err); }
};

