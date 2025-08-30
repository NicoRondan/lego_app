const { Op } = require('sequelize');
const { HomeLayout, Banner, Page } = require('../../infra/models');

function nowUtc() {
  return new Date();
}

// GET /home - returns latest published home layout and resolved active banners
exports.getHome = async (_req, res, next) => {
  try {
    const layout = await HomeLayout.findOne({
      where: { publishedAt: { [Op.not]: null } },
      order: [['version', 'DESC'], ['id', 'DESC']],
    });
    const now = nowUtc();
    const banners = await Banner.findAll({
      where: {
        isActive: true,
        [Op.and]: [
          { [Op.or]: [{ startsAt: null }, { startsAt: { [Op.lte]: now } }] },
          { [Op.or]: [{ endsAt: null }, { endsAt: { [Op.gte]: now } }] },
        ],
      },
      order: [['id', 'DESC']],
    });
    // Map banners by id for quick lookup in FE
    const bannersById = {};
    for (const b of banners) bannersById[b.id] = b;
    res.json({
      layout: layout ? layout.json : { sections: [] },
      version: layout ? layout.version : 0,
      publishedAt: layout ? layout.publishedAt : null,
      bannersById,
    });
  } catch (err) { next(err); }
};

// GET /pages/:slug - returns a published page by slug
exports.getPageBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || '').trim();
    const now = nowUtc();
    const page = await Page.findOne({
      where: {
        slug,
        [Op.or]: [
          { publishedAt: null }, // allow null for draft preview? keep published only in public path
          { publishedAt: { [Op.lte]: now } },
        ],
      },
      order: [['id', 'DESC']],
    });
    if (!page || !page.publishedAt) return res.status(404).json({ error: 'Page not found' });
    res.json({ slug: page.slug, title: page.title, body: page.body, publishedAt: page.publishedAt, updatedAt: page.updatedAt });
  } catch (err) { next(err); }
};

