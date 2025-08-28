const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  User,
  Address,
  Order,
  OrderItem,
  Product,
  UserEvent,
  AdminImpersonationToken,
  AdminAuditLog,
} = require('../../infra/models');
const { sequelize } = require('../../infra/models');

function maskEmail(email) {
  if (!email) return email;
  const [user, domain] = String(email).split('@');
  if (!domain) return email;
  const maskedUser = user.length <= 2 ? '*'.repeat(user.length) : user[0] + '*'.repeat(user.length - 2) + user[user.length - 1];
  return `${maskedUser}@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length);
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

function sanitizeUserForRole(user, role) {
  const data = { ...user.get({ plain: true }) };
  if (role !== 'support' && role !== 'superadmin') {
    data.email = maskEmail(data.email);
    data.phone = maskPhone(data.phone);
  }
  return data;
}

exports.listUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
    const where = q ? {
      [Op.or]: [
        { email: { [Op.like]: `%${q}%` } },
        { name: { [Op.like]: `%${q}%` } },
      ],
    } : {};
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id','name','email','phone','role','marketingOptIn','createdAt','lastLoginAt'],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
    const ids = rows.map(r => r.id);
    const orderCounts = await Order.findAll({
      attributes: [[sequelize.col('user_id'), 'userId'], [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
      where: sequelize.where(sequelize.col('user_id'), { [Op.in]: ids }),
      group: ['user_id'],
      raw: true,
    });
    const hasOrders = new Set(orderCounts.filter(r => parseInt(r.cnt, 10) > 0).map(r => r.userId));
    const role = req.user?.role;
    const data = rows.map(u => ({ ...sanitizeUserForRole(u, role), hasOrders: hasOrders.has(u.id) }));
    res.json({ data, meta: { page, pageSize, total: count } });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await User.findByPk(id, {
      attributes: ['id','name','email','phone','role','marketingOptIn','createdAt','lastLoginAt'],
      include: [
        { model: Address, as: 'addresses' },
        { model: Order, as: 'orders', limit: 5, order: [['createdAt','DESC']], include: [{ model: OrderItem, as: 'items', include: [Product] }] },
        { model: UserEvent, as: 'events', limit: 20, order: [['createdAt','DESC']] },
      ],
    });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    const role = req.user?.role;
    const data = sanitizeUserForRole(user, role);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, phone, marketingOptIn } = req.body || {};
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(400).json({ error: { message: 'Email already in use' } });
      user.email = email;
    }
    if (name != null) user.name = name;
    if (phone != null) user.phone = phone;
    if (marketingOptIn != null) user.marketingOptIn = !!marketingOptIn;
    await user.save();
    // audit
    await AdminAuditLog.create({
      adminUserId: null,
      action: 'user_update',
      targetUserId: user.id,
      ip: req.ip,
      detail: { actorUserId: req.user?.id, changes: Object.keys(req.body || {}) },
    });
    const role = req.user?.role;
    res.json(sanitizeUserForRole(user, role));
  } catch (err) {
    next(err);
  }
};

exports.listAddresses = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const addrs = await Address.findAll({ where: { UserId: userId }, order: [['is_default','DESC'], ['createdAt','DESC']] });
    res.json(addrs);
  } catch (err) {
    next(err);
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { type, name, line1, line2, city, state, zip, country, isDefault } = req.body || {};
    if (isDefault && type) {
      await Address.update({ isDefault: false }, { where: { UserId: userId, type } });
    }
    const addr = await Address.create({ UserId: userId, type, name, line1, line2, city, state, zip, country, isDefault: !!isDefault, street: line1 || null });
    // audit
    await AdminAuditLog.create({ adminUserId: null, action: 'address_create', targetUserId: userId, ip: req.ip, detail: { actorUserId: req.user?.id, addressId: addr.id } });
    res.status(201).json(addr);
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const addressId = parseInt(req.params.addressId, 10);
    const addr = await Address.findOne({ where: { id: addressId, UserId: userId } });
    if (!addr) return res.status(404).json({ error: { message: 'Address not found' } });
    await addr.destroy();
    await AdminAuditLog.create({ adminUserId: null, action: 'address_delete', targetUserId: userId, ip: req.ip, detail: { actorUserId: req.user?.id, addressId } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const addressId = parseInt(req.params.addressId, 10);
    const addr = await Address.findOne({ where: { id: addressId, UserId: userId } });
    if (!addr) return res.status(404).json({ error: { message: 'Address not found' } });
    const { type, name, line1, line2, city, state, zip, country, isDefault } = req.body || {};
    if (isDefault && (type || addr.type)) {
      await Address.update({ isDefault: false }, { where: { UserId: userId, type: type || addr.type } });
      addr.isDefault = true;
    } else if (isDefault === false) {
      addr.isDefault = false;
    }
    if (type != null) addr.type = type;
    if (name != null) addr.name = name;
    if (line1 != null) addr.line1 = line1;
    if (line2 != null) addr.line2 = line2;
    if (city != null) addr.city = city;
    if (state != null) addr.state = state;
    if (zip != null) addr.zip = zip;
    if (country != null) addr.country = country;
    if (line1 != null) addr.street = line1; // keep legacy in sync
    await addr.save();
    await AdminAuditLog.create({ adminUserId: null, action: 'address_update', targetUserId: userId, ip: req.ip, detail: { actorUserId: req.user?.id, addressId } });
    res.json(addr);
  } catch (err) {
    next(err);
  }
};

// Admin audit log for a specific customer (targetUserId)
exports.listAudit = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const rows = await AdminAuditLog.findAll({
      where: { targetUserId: userId },
      order: [['created_at', 'DESC']],
      limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.impersonate = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const ttlMinutes = parseInt(process.env.IMPERSONATION_TTL_MIN || '10', 10);
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await AdminImpersonationToken.create({ token, adminUserId: null, userId, expiresAt, ip: req.ip });
    await AdminAuditLog.create({ adminUserId: null, action: 'impersonate_token', targetUserId: userId, ip: req.ip, detail: { actorUserId: req.user?.id } });
    res.json({ token, expiresAt });
  } catch (err) {
    next(err);
  }
};
