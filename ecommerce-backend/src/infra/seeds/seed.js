const {
  sequelize,
  User,
  Product,
  Category,
  Coupon,
  Order,
  OrderItem,
  ProductMedia,
  ProductPriceHistory,
} = require('../models');
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
      setNumber: '75192',
      name: 'Millennium Falcon',
      description: 'Legendary ship from the Star Wars saga.',
      msrp: 799.99,
      price: 799.99,
      currency: 'USD',
      stock: 5,
      pieceCount: 7541,
      minifigCount: 7,
      ageMin: 16,
      ageMax: 99,
      weightGrams: 13800,
      boxWidthMm: 585,
      boxHeightMm: 465,
      boxDepthMm: 385,
      categories: ['Star Wars'],
      images: ['https://http2.mlstatic.com/D_NQ_NP_622899-MLA79622738790_102024-O.webp'],
      isNew: true,
    },
    {
      code: 'TECH001',
      setNumber: '42083',
      name: 'Bugatti Chiron',
      description: 'Advanced Technic model of the Bugatti Chiron supercar.',
      msrp: 349.99,
      price: 299.99,
      currency: 'USD',
      stock: 10,
      pieceCount: 3599,
      minifigCount: 0,
      ageMin: 16,
      ageMax: 99,
      weightGrams: 6030,
      boxWidthMm: 600,
      boxHeightMm: 400,
      boxDepthMm: 200,
      categories: ['Technic'],
      images: ['https://http2.mlstatic.com/D_NQ_NP_789320-CBT75582987554_042024-O.webp'],
      isOnSale: true,
    },
    {
      code: 'CITY001',
      setNumber: '60246',
      name: 'City Police Station',
      description: 'Classic police station set for the LEGO City lineup.',
      msrp: 99.99,
      price: 89.99,
      currency: 'USD',
      stock: 20,
      pieceCount: 743,
      minifigCount: 6,
      ageMin: 6,
      ageMax: 12,
      weightGrams: 1700,
      boxWidthMm: 480,
      boxHeightMm: 378,
      boxDepthMm: 70,
      categories: ['City'],
      images: ['https://http2.mlstatic.com/D_NQ_NP_870836-MLU70505580380_072023-O.webp'],
      isNew: true,
    },
    {
      code: 'IDEA001',
      setNumber: '21318',
      name: 'Tree House',
      description: 'Buildable tree house from LEGO Ideas.',
      msrp: 249.99,
      price: 249.99,
      currency: 'USD',
      stock: 15,
      pieceCount: 3036,
      minifigCount: 4,
      ageMin: 16,
      ageMax: 99,
      weightGrams: 4310,
      boxWidthMm: 570,
      boxHeightMm: 480,
      boxDepthMm: 118,
      categories: ['Ideas'],
      images: ['https://http2.mlstatic.com/D_NQ_NP_706384-MLA83330494387_032025-O.webp'],
    },
    {
      code: 'HP001',
      setNumber: '71043',
      name: 'Hogwarts Castle',
      description: 'Magical castle from the Harry Potter series.',
      msrp: 399.99,
      price: 349.99,
      currency: 'USD',
      stock: 8,
      pieceCount: 6020,
      minifigCount: 27,
      ageMin: 16,
      ageMax: 99,
      weightGrams: 7580,
      boxWidthMm: 650,
      boxHeightMm: 485,
      boxDepthMm: 275,
      categories: ['Harry Potter'],
      images: ['https://images-cdn.ubuy.com.ar/66f8ec24049a283fc72b94ce-lego-harry-potter-hogwarts-castle.jpg'],
      isOnSale: true,
    },
    {
      code: 'CRE001',
      setNumber: '10252',
      name: 'Volkswagen Beetle',
      description: 'Iconic Beetle from the Creator Expert line.',
      msrp: 89.99,
      price: 79.99,
      currency: 'USD',
      stock: 25,
      pieceCount: 1167,
      minifigCount: 0,
      ageMin: 16,
      ageMax: 99,
      weightGrams: 1710,
      boxWidthMm: 354,
      boxHeightMm: 382,
      boxDepthMm: 94,
      categories: ['Creator'],
      images: ['https://http2.mlstatic.com/D_NQ_NP_918629-MLA50820227389_072022-O.webp'],
    },
    {
      code: 'SWCRE001',
      // intentionally omit setNumber to test TMP slug fallback
      name: 'Darth Vader Helmet',
      description: 'Build-and-display helmet of Darth Vader.',
      msrp: 69.99,
      price: 69.99,
      currency: 'USD',
      stock: 30,
      pieceCount: 834,
      minifigCount: 0,
      ageMin: 18,
      ageMax: 99,
      weightGrams: 912,
      boxWidthMm: 193,
      boxHeightMm: 354,
      boxDepthMm: 118,
      categories: ['Star Wars', 'Creator'],
      images: ['https://http2.mlstatic.com/D_Q_NP_954688-MLA84852351437_052025-O.webp'],
    },
  ];

  const slugify = (str) =>
    str
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const products = [];
  for (const set of legoSets) {
    const slugBase = set.setNumber ? `${set.setNumber}-${set.name}` : `TMP-${set.code}`;
    const slug = slugify(slugBase);

    const product = await Product.create({
      code: set.code,
      slug,
      setNumber: set.setNumber,
      name: set.name,
      description: set.description,
      price: set.price.toFixed(2),
      currency: set.currency,
      stock: set.stock,
      imageUrl: set.images[0],
      pieceCount: set.pieceCount,
      minifigCount: set.minifigCount,
      weightGrams: set.weightGrams,
      boxWidthMm: set.boxWidthMm,
      boxHeightMm: set.boxHeightMm,
      boxDepthMm: set.boxDepthMm,
      msrp: set.msrp,
      isNew: !!set.isNew,
      isOnSale: !!set.isOnSale,
      ageMinYears: set.ageMin,
      ageMaxYears: set.ageMax,
    });

    const cats = set.categories.map((name) => categories[name]).filter(Boolean);
    await product.setCategories(cats);

    if (set.images && set.images.length) {
      const mediaRecords = set.images.map((url) => ({
        productId: product.id,
        url,
        type: 'image',
      }));
      await ProductMedia.bulkCreate(mediaRecords);
    }

    const priceHistoryEntries = [];
    if (set.msrp !== undefined)
      priceHistoryEntries.push({ productId: product.id, price: set.msrp });
    if (set.price !== undefined)
      priceHistoryEntries.push({ productId: product.id, price: set.price });
    if (priceHistoryEntries.length)
      await ProductPriceHistory.bulkCreate(priceHistoryEntries);

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
    const order = await Order.create({ userId: user.id, total: 0, status: 'pending', currency: 'USD' });

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
        displayName: product.name,
        thumbnailUrl: product.imageUrl,
        currency: product.currency,
        lineSubtotal: subtotal,
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

    order.grandTotal = total.toFixed(2);
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
