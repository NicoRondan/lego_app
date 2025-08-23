const { sequelize, User, Product, Category, Coupon, Order, OrderItem } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  // Categories
  const categories = [];
  for (let i = 1; i <= 5; i++) {
    categories.push(await Category.create({ name: `Category ${i}` }));
  }

  // Products
  const products = [];
  for (let i = 1; i <= 50; i++) {
    const product = await Product.create({
      code: `PRD${i}`,
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      price: (10 + Math.random() * 90).toFixed(2),
      currency: 'USD',
      stock: Math.floor(Math.random() * 100),
    });

    const assigned = new Set();
    const num = Math.floor(Math.random() * 3) + 1;
    while (assigned.size < num) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      assigned.add(cat);
    }
    await product.setCategories([...assigned]);
    products.push(product);
  }

  // Users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const isAdmin = i <= 2;
    users.push(await User.create({
      name: isAdmin ? `Admin ${i}` : `User ${i - 2}`,
      email: isAdmin ? `admin${i}@example.com` : `user${i - 2}@example.com`,
      role: isAdmin ? 'admin' : 'customer',
    }));
  }

  // Coupons
  const coupons = [];
  for (let i = 1; i <= 5; i++) {
    coupons.push(await Coupon.create({
      code: `COUPON${i}`,
      type: 'percentage',
      value: 5 * i,
    }));
  }

  // Orders
  for (let i = 1; i <= 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const order = await Order.create({ userId: user.id, total: 0, status: 'created' });

    let total = 0;
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < itemsCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = parseFloat(product.price);
      const subtotal = unitPrice * quantity;
      total += subtotal;
      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity,
        unitPrice,
        subtotal,
      });
    }

    if (Math.random() < 0.3) {
      const coupon = coupons[Math.floor(Math.random() * coupons.length)];
      await order.setCoupon(coupon);
      if (coupon.type === 'percentage') {
        total = total * (1 - parseFloat(coupon.value) / 100);
      } else if (coupon.type === 'fixed') {
        total = total - parseFloat(coupon.value);
      }
    }

    order.total = total.toFixed(2);
    await order.save();
  }

  console.log('Database seeded');
}

seed().then(() => sequelize.close()).catch(err => {
  console.error(err);
  sequelize.close();
});
