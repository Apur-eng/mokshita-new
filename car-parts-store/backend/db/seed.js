const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const categories = [
  { id: uuidv4(), name: 'Brakes', slug: 'brakes', description: 'Pads, rotors, calipers & brake fluid', image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80' },
  { id: uuidv4(), name: 'Engine', slug: 'engine', description: 'Filters, belts, spark plugs & gaskets', image_url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80' },
  { id: uuidv4(), name: 'Suspension', slug: 'suspension', description: 'Shocks, struts, control arms & bushings', image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80' },
  { id: uuidv4(), name: 'Electrical', slug: 'electrical', description: 'Batteries, alternators, starters & sensors', image_url: 'https://images.unsplash.com/photo-1619642751034-765df6917ebb?w=600&q=80' },
  { id: uuidv4(), name: 'Exhaust', slug: 'exhaust', description: 'Mufflers, catalytic converters & pipes', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
  { id: uuidv4(), name: 'Filters & Fluids', slug: 'filters-fluids', description: 'Oil, air, cabin & fuel filters plus fluids', image_url: 'https://images.unsplash.com/photo-1625047509248-ec889cb1b38?w=600&q=80' },
];

const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

const products = [
  { category: 'brakes', name: 'Ceramic Brake Pad Set — Front', slug: 'ceramic-brake-pads-front', description: 'Premium ceramic brake pads for quiet, low-dust stopping power. Fits most sedans and crossovers.', price: 49.99, compare_at_price: 69.99, sku: 'BRK-CP-F001', brand: 'StopMax', vehicle_fitment: 'Universal Front — check fitment guide', stock: 120, featured: 1, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { category: 'brakes', name: 'Drilled & Slotted Rotor Pair', slug: 'drilled-slotted-rotors', description: 'Vented rotors with cross-drilled and slotted design for improved heat dissipation.', price: 89.99, compare_at_price: 119.99, sku: 'BRK-DS-R002', brand: 'StopMax', vehicle_fitment: 'Honda Accord 2018–2023', stock: 45, featured: 1, image_url: 'https://images.unsplash.com/photo-1619642751034-765df6917ebb?w=600&q=80' },
  { category: 'brakes', name: 'DOT 4 Brake Fluid — 32oz', slug: 'dot4-brake-fluid', description: 'High-temp synthetic brake fluid meeting DOT 4 specifications. Boiling point 509°F dry.', price: 12.99, sku: 'BRK-BF-D004', brand: 'FluidPro', vehicle_fitment: 'Universal', stock: 200, featured: 0, image_url: 'https://images.unsplash.com/photo-1625047509248-ec889cb1b38?w=600&q=80' },
  { category: 'engine', name: 'High-Flow Air Filter', slug: 'high-flow-air-filter', description: 'Reusable cotton gauze air filter increases airflow up to 50% over stock paper filters.', price: 34.99, compare_at_price: 44.99, sku: 'ENG-AF-HF01', brand: 'FlowTech', vehicle_fitment: 'Toyota Camry 2018+', stock: 80, featured: 1, image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80' },
  { category: 'engine', name: 'Iridium Spark Plug Set (4)', slug: 'iridium-spark-plugs-4', description: 'Fine-wire iridium plugs for improved fuel economy and smoother idle. Set of 4.', price: 28.99, sku: 'ENG-SP-IR04', brand: 'IgniteX', vehicle_fitment: '4-cylinder engines', stock: 150, featured: 0, image_url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80' },
  { category: 'engine', name: 'Serpentine Belt — Premium', slug: 'serpentine-belt-premium', description: 'EPDM rubber belt with aramid cord reinforcement. Resists cracking and stretching.', price: 22.99, sku: 'ENG-BT-SR01', brand: 'DriveLine', vehicle_fitment: 'Ford F-150 2015–2020', stock: 65, featured: 0, image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80' },
  { category: 'suspension', name: 'Front Strut Assembly Pair', slug: 'front-strut-assembly', description: 'Complete strut assembly with spring and mount. Pre-assembled for easy installation.', price: 159.99, compare_at_price: 199.99, sku: 'SUS-ST-F001', brand: 'RidePro', vehicle_fitment: 'Chevrolet Malibu 2016–2021', stock: 30, featured: 1, image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
  { category: 'suspension', name: 'Rear Shock Absorber Pair', slug: 'rear-shock-absorbers', description: 'Gas-charged twin-tube shocks for improved ride comfort and handling stability.', price: 74.99, sku: 'SUS-SH-R002', brand: 'RidePro', vehicle_fitment: 'Universal rear — check specs', stock: 55, featured: 0, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { category: 'electrical', name: 'AGM Car Battery  Group 35', slug: 'agm-battery-group35', description: '750 CCA absorbed glass mat battery. Maintenance-free with 3-year warranty.', price: 189.99, compare_at_price: 229.99, sku: 'ELC-BT-G35', brand: 'PowerCell', vehicle_fitment: 'Group 35 — Honda, Nissan, Subaru', stock: 25, featured: 1, image_url: 'https://images.unsplash.com/photo-1619642751034-765df6917ebb?w=600&q=80' },
  { category: 'electrical', name: 'Remanufactured Alternator 140A', slug: 'alternator-140a', description: '140-amp remanufactured alternator. Includes pulley and internal regulator.', price: 129.99, sku: 'ELC-ALT-140', brand: 'ChargeMax', vehicle_fitment: 'GM 3.6L V6 applications', stock: 18, featured: 0, image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80' },
  { category: 'exhaust', name: 'Stainless Steel Cat-Back Exhaust', slug: 'catback-exhaust-stainless', description: 'Mandrel-bent 2.5" stainless system with polished tips. Deep tone, +8 HP gain.', price: 449.99, compare_at_price: 549.99, sku: 'EXH-CB-SS01', brand: 'FlowTech', vehicle_fitment: 'Mustang GT 2015–2023', stock: 12, featured: 1, image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
  { category: 'filters-fluids', name: 'Full Synthetic Motor Oil 5W-30 (5qt)', slug: 'synthetic-oil-5w30', description: 'Advanced full synthetic oil. Protects up to 10,000 miles between changes.', price: 32.99, sku: 'FLD-OIL-530', brand: 'LubeMax', vehicle_fitment: 'Universal 5W-30 spec', stock: 300, featured: 1, image_url: 'https://images.unsplash.com/photo-1625047509248-ec889cb1b38?w=600&q=80' },
  { category: 'filters-fluids', name: 'Oil Filter — Premium Spin-On', slug: 'oil-filter-spin-on', description: 'Anti-drainback valve and silicone anti-drain gasket. 99% filtration efficiency.', price: 8.99, sku: 'FLD-OF-SP01', brand: 'FilterPro', vehicle_fitment: 'Most Japanese & domestic vehicles', stock: 400, featured: 0, image_url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80' },
  { category: 'filters-fluids', name: 'Cabin Air Filter — Activated Carbon', slug: 'cabin-air-filter-carbon', description: 'Triple-layer filter with activated carbon layer removes odors and allergens.', price: 16.99, sku: 'FLD-CAF-CB01', brand: 'FilterPro', vehicle_fitment: 'Universal — measure old filter', stock: 175, featured: 0, image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80' },
];

function seed() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (existing.count > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const insertCat = db.prepare(
    'INSERT INTO categories (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)'
  );
  const insertProd = db.prepare(`
    INSERT INTO products (id, category_id, name, slug, description, price, compare_at_price, sku, brand, vehicle_fitment, stock, image_url, featured, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const seedAll = db.transaction(() => {
    for (const cat of categories) {
      insertCat.run(cat.id, cat.name, cat.slug, cat.description, cat.image_url);
    }
    for (const p of products) {
      insertProd.run(
        uuidv4(),
        catMap[p.category],
        p.name,
        p.slug,
        p.description,
        p.price,
        p.compare_at_price || null,
        p.sku,
        p.brand,
        p.vehicle_fitment,
        p.stock,
        p.image_url,
        p.featured || 0
      );
    }

    const demoHash = bcrypt.hashSync('demo1234', 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, full_name, phone) VALUES (?, ?, ?, ?, ?)'
    ).run(uuidv4(), 'demo@autoparts.com', demoHash, 'Demo User', '555-0100');
  });

  seedAll();
  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  console.log('Demo account: demo@autoparts.com / demo1234');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
