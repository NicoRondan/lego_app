const { sequelize, User, Product, Category, Coupon, Order, OrderItem } = require('../models');
const bcrypt = require('bcrypt');

async function seed() {
  await sequelize.sync({ force: true });

  // Categories
  const categoryNames = ['Star Wars', 'Technic', 'City', 'Ideas', 'Harry Potter', 'Creator'];
  const categories = {};
  for (const name of categoryNames) {
    categories[name] = await Category.create({ name });
  }

  // Products
  const legoSets = [
    {
      code: 'SW001',
      name: 'Millennium Falcon',
      description: 'Legendary ship from the Star Wars saga.',
      price: 799.99,
      currency: 'USD',
      stock: 5,
      categories: ['Star Wars'],
      images: ['https://picsum.photos/seed/lego-millennium-falcon/600/400'],
      isNew: true,
    },
    {
      code: 'TECH001',
      name: 'Bugatti Chiron',
      description: 'Advanced Technic model of the Bugatti Chiron supercar.',
      price: 349.99,
      currency: 'USD',
      stock: 10,
      categories: ['Technic'],
      images: ['https://picsum.photos/seed/lego-bugatti/600/400'],
      isOnSale: true,
    },
    {
      code: 'CITY001',
      name: 'City Police Station',
      description: 'Classic police station set for the LEGO City lineup.',
      price: 99.99,
      currency: 'USD',
      stock: 20,
      categories: ['City'],
      images: ['https://picsum.photos/seed/lego-police-station/600/400'],
      isNew: true,
    },
    {
      code: 'IDEA001',
      name: 'Tree House',
      description: 'Buildable tree house from LEGO Ideas.',
      price: 249.99,
      currency: 'USD',
      stock: 15,
      categories: ['Ideas'],
      images: ['https://picsum.photos/seed/lego-tree-house/600/400'],
    },
    {
      code: 'HP001',
      name: 'Hogwarts Castle',
      description: 'Magical castle from the Harry Potter series.',
      price: 399.99,
      currency: 'USD',
      stock: 8,
      categories: ['Harry Potter'],
      images: ['https://picsum.photos/seed/lego-hogwarts/600/400'],
      isOnSale: true,
    },
    {
      code: 'CRE001',
      name: 'Volkswagen Beetle',
      description: 'Iconic Beetle from the Creator Expert line.',
      price: 89.99,
      currency: 'USD',
      stock: 25,
      categories: ['Creator'],
      images: ['https://picsum.photos/seed/lego-beetle/600/400'],
    },
    {
      code: 'SWCRE001',
      name: 'Darth Vader Helmet',
      description: 'Build-and-display helmet of Darth Vader.',
      price: 69.99,
      currency: 'USD',
      stock: 30,
      categories: ['Star Wars', 'Creator'],
      images: ['https://picsum.photos/seed/lego-vader-helmet/600/400'],
    },
  ];

  const products = [];
  for (const set of legoSets) {
    const product = await Product.create({
      code: set.code,
      name: set.name,
      description: set.description,
      price: set.price.toFixed(2),
      currency: set.currency,
      stock: set.stock,
      imageUrl: set.images[0],
      isNew: !!set.isNew,
      isOnSale: !!set.isOnSale,
    });

    const cats = set.categories.map((name) => categories[name]).filter(Boolean);
    await product.setCategories(cats);
    products.push(product);
  }

  // Users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const isAdmin = i <= 2;
    const passwordHash = await bcrypt.hash('password123', 10);
    users.push(
      await User.create({
        name: isAdmin ? `Admin ${i}` : `User ${i - 2}`,
        email: isAdmin ? `admin${i}@example.com` : `user${i - 2}@example.com`,
        role: isAdmin ? 'admin' : 'customer',
        passwordHash,
      })
    );
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

module.exports = { seed };

if (require.main === module) {
  seed()
    .then(() => sequelize.close())
    .catch((err) => {
      console.error(err);
      sequelize.close();
    });
}
