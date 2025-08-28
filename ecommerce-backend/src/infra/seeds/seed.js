const {
  sequelize,
  User,
  Product,
  Inventory,
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
      allowCoupon: false,
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
      allowCoupon: set.allowCoupon === false ? false : true,
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

  // Ensure inventory rows mirror initial product stock
  for (const product of products) {
    await Inventory.findOrCreate({
      where: { productId: product.id },
      defaults: { stock: product.stock, safetyStock: 0, reserved: 0 },
    });
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
  // Admin roles for RBAC
  const rbRoles = ['superadmin','support','catalog_manager','oms','marketing'];
  for (const r of rbRoles) {
    const passwordHash = await bcrypt.hash('password123', 10);
    users.push(await User.create({ name: r.toUpperCase(), email: `${r}@example.com`, role: r, passwordHash }));
  }

  // Coupons (sample)
  const coupons = [];
  coupons.push(await Coupon.create({
    code: 'TENOFF', type: 'percent', value: 10,
    status: 'active', maxUses: 100, perUserLimit: 2,
    validFrom: new Date(Date.now() - 24*60*60*1000),
    validTo: new Date(Date.now() + 30*24*60*60*1000),
  }));
  coupons.push(await Coupon.create({
    code: 'STAR20', type: 'fixed', value: 20,
    status: 'active', minSubtotal: 100,
    allowedThemes: ['Star Wars'],
  }));
  coupons.push(await Coupon.create({
    code: 'NOCITY15', type: 'percent', value: 15,
    status: 'active', disallowProducts: ['CITY001'],
  }));
  coupons.push(await Coupon.create({
    code: 'EXPIRED5', type: 'percent', value: 5,
    status: 'active', validTo: new Date(Date.now() - 24*60*60*1000),
  }));
  coupons.push(await Coupon.create({
    code: 'STACK5', type: 'percent', value: 5,
    status: 'active', stackable: true, perUserLimit: 5,
  }));
  coupons.push(await Coupon.create({
    code: 'SINGLE30', type: 'fixed', value: 30,
    status: 'active', stackable: false, perUserLimit: 1, maxUses: 50,
  }));

  // Orders: generate over last ~60 days across statuses to exercise reports
  const now = new Date();
  const pickStatus = () => {
    // Weights: pending 15%, picking 10%, paid 35%, shipped 25%, delivered 15%
    const r = Math.random();
    if (r < 0.15) return 'pending';
    if (r < 0.25) return 'picking';
    if (r < 0.60) return 'paid';
    if (r < 0.85) return 'shipped';
    return 'delivered';
  };

  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const ordersToday = 1 + Math.floor(Math.random() * 3); // 1..3
    for (let k = 0; k < ordersToday; k++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const ts = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 12) * 60 * 60 * 1000);
      const status = pickStatus();

      const order = await Order.create({
        userId: user.id,
        total: 0,
        grandTotal: 0,
        discountTotal: 0,
        status,
        currency: 'USD',
        createdAt: ts,
        updatedAt: ts,
      });

      let gross = 0;
      const itemsCount = 1 + Math.floor(Math.random() * 3); // 1..3
      const usedProductIds = new Set();
      for (let j = 0; j < itemsCount; j++) {
        // ensure some diversity and avoid duplicate same product occasionally
        let product;
        let guard = 0;
        do {
          product = products[Math.floor(Math.random() * products.length)];
          guard++;
        } while (usedProductIds.has(product.id) && guard < 5);
        usedProductIds.add(product.id);
        const quantity = 1 + Math.floor(Math.random() * 3);
        const unitPrice = parseFloat(product.price);
        const subtotal = unitPrice * quantity;
        gross += subtotal;
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
          createdAt: ts,
          updatedAt: ts,
        });
      }

      // Occasionally apply coupon and record discount_total for reports
      let discount = 0;
      if (Math.random() < 0.35) {
        const coupon = coupons[Math.floor(Math.random() * coupons.length)];
        await order.setCoupon(coupon);
        order.couponCode = coupon.code;
        const t = (coupon.type || '').toLowerCase();
        if (t === 'percentage' || t === 'percent') {
          discount = (gross * parseFloat(coupon.value)) / 100;
        } else if (t === 'fixed') {
          discount = parseFloat(coupon.value);
        }
        if (discount > gross) discount = gross;
      }

      const net = Math.max(0, gross - discount);
      order.discountTotal = discount.toFixed(2);
      order.grandTotal = net.toFixed(2);
      order.total = net.toFixed(2);
      await order.save({ silent: true });
    }
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
