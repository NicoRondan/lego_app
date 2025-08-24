// Example reporting queries using Sequelize
const { Op } = require('sequelize');
const { sequelize, Order, OrderItem, Product, Category } = require('./models');

// Sales aggregated by product category between a date range
async function salesByCategory(startDate, endDate) {
  return OrderItem.findAll({
    attributes: [
      [sequelize.col('Product->categories.name'), 'category'],
      [sequelize.fn('SUM', sequelize.col('subtotal')), 'total'],
    ],
    include: [
      {
        model: Order,
        attributes: [],
        where: { createdAt: { [Op.between]: [startDate, endDate] } },
      },
      {
        model: Product,
        attributes: [],
        include: [
          {
            model: Category,
            as: 'categories',
            attributes: [],
            through: { attributes: [] },
          },
        ],
      },
    ],
    group: ['Product->categories.name'],
    raw: true,
  });
}

// Sales aggregated by order creation date between a date range
async function salesByDate(startDate, endDate) {
  return Order.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('SUM', sequelize.col('total')), 'total'],
    ],
    where: { createdAt: { [Op.between]: [startDate, endDate] } },
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    raw: true,
  });
}

module.exports = {
  salesByCategory,
  salesByDate,
};
