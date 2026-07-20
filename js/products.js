const products = [
  {
    id: "taj-mahal-watercolour",
    title: "Taj Mahal Watercolour (A5)",
    category: "painting",
    price: 600,
    oldPrice: 850,
    discount: "30% OFF",
    rating: 4.9,
    reviews: 42,
    tag: "Painting",
    shortDesc: "Exquisite hand-painted Taj Mahal watercolour on A5 archival paper, bringing the monument of love to life. Delicate brushstrokes capture the ethereal beauty of the marble facade against a serene sky.",
    origin: "Crafted in Agra, Uttar Pradesh",
    mainImage: "images/items/watercolourtajmahal1.jpeg",
    thumbnails: [
      "images/items/watercolourtajmahal1.jpeg",
      "images/items/pichwai art3.jpeg",
      "images/items/watercolourpaint3.jpeg"
    ]
  },
  {
    id: "pichwai-art",
    title: "Pichwai Art (A5)",
    category: "painting",
    price: 650,
    oldPrice: 900,
    discount: "27% OFF",
    rating: 4.8,
    reviews: 28,
    tag: "Painting",
    shortDesc: "Devotional paintings depicting Lord Krishna's life, crafted on handwoven cotton cloth with natural pigments.",
    origin: "Crafted in Nathdwara, Rajasthan",
    mainImage: "images/items/pichwai art3.jpeg",
    thumbnails: [
      "images/items/pichwai art3.jpeg",
      "images/items/watercolourtajmahal1.jpeg"
    ]
  },
  {
    id: "watercolour-mini",
    title: "Watercolour Mini (2.5×6 inch)",
    category: "painting",
    price: 300,
    oldPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 15,
    tag: "Painting",
    shortDesc: "Delicate miniature-inspired watercolours, perfect for elegant home decor and gifting.",
    origin: "Crafted in Jaipur, Rajasthan",
    mainImage: "images/items/watercolourpaint3.jpeg",
    thumbnails: [
      "images/items/watercolourpaint3.jpeg"
    ]
  },
  {
    id: "marble-tortoise",
    title: "Marble Tortoise (Inlay Work, 2.5\")",
    category: "marble",
    price: 430,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviews: 55,
    tag: "Marble",
    shortDesc: "Finely carved Makrana marble tortoise with authentic pietra dura stone inlay work.",
    origin: "Crafted in Agra, Uttar Pradesh",
    mainImage: "images/items/Handcrafted marble plates with floral design (1).png",
    thumbnails: [
      "images/items/Handcrafted marble plates with floral design (1).png"
    ]
  },
  {
    id: "coaster-plates",
    title: "Marble Coaster Plates (5\")",
    category: "marble",
    price: 750,
    oldPrice: 1000,
    discount: "25% OFF",
    rating: 4.8,
    reviews: 32,
    tag: "Marble",
    shortDesc: "Set of elegant 5-inch Makrana marble coasters featuring intricate floral inlay patterns.",
    origin: "Crafted in Agra, Uttar Pradesh",
    mainImage: "images/items/Handcrafted marble plates with floral design (1).png",
    thumbnails: [
      "images/items/Handcrafted marble plates with floral design (1).png"
    ]
  },
  {
    id: "wooden-dice",
    title: "Wooden Dice",
    category: "wooden",
    price: 370,
    oldPrice: null,
    discount: null,
    rating: 4.6,
    reviews: 18,
    tag: "Wooden",
    shortDesc: "Hand-carved premium wooden dice set, polished to a smooth, natural finish.",
    origin: "Crafted in Saharanpur, Uttar Pradesh",
    mainImage: "images/items/Wooden dice and wooden die holder.jpg.jpeg",
    thumbnails: [
      "images/items/Wooden dice and wooden die holder.jpg.jpeg"
    ]
  },
  {
    id: "wooden-ganesha",
    title: "Wooden Ganesha (2\")",
    category: "wooden",
    price: 310,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviews: 62,
    tag: "Wooden",
    shortDesc: "A beautifully detailed 2-inch wooden carving of Lord Ganesha, perfect for your altar or desk.",
    origin: "Crafted in Jaipur, Rajasthan",
    mainImage: "images/items/Handcrafted Ganesha idol on white background.png",
    thumbnails: [
      "images/items/Handcrafted Ganesha idol on white background.png"
    ]
  },
  {
    id: "crochet-doll",
    title: "Crochet Doll (Multicolour)",
    category: "crochet",
    price: 750,
    oldPrice: 900,
    discount: "16% OFF",
    rating: 4.9,
    reviews: 41,
    tag: "Crochet",
    shortDesc: "Lovingly handcrafted multicolour crochet doll, made from pure cotton yarn.",
    origin: "Crafted by Women Artisans, India",
    mainImage: "images/items/Handmade crochet doll with vibrant yarn details.png",
    thumbnails: [
      "images/items/Handmade crochet doll with vibrant yarn details.png"
    ]
  },
  {
    id: "crochet-turtle",
    title: "Crochet Turtle (Multicolour)",
    category: "crochet",
    price: 350,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 29,
    tag: "Crochet",
    shortDesc: "A vibrant, soft multicolour crochet turtle, showcasing intricate thread artistry.",
    origin: "Crafted by Women Artisans, India",
    mainImage: "images/items/Crochet turtles side by side.png",
    thumbnails: [
      "images/items/Crochet turtles side by side.png"
    ]
  },
  {
    id: "sunflower-keyring",
    title: "Crochet Sunflower Keyring",
    category: "crochet",
    price: 250,
    oldPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 14,
    tag: "Crochet",
    shortDesc: "A bright and cheerful sunflower crochet keyring, perfect as an everyday accessory.",
    origin: "Crafted by Women Artisans, India",
    mainImage: "images/items/Sunflower.jpg.jpeg",
    thumbnails: [
      "images/items/Sunflower.jpg.jpeg"
    ]
  },
  {
    id: "elephant-pouch",
    title: "Hand-painted Elephant Pouch",
    category: "textile",
    price: 550,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 37,
    tag: "Textile",
    shortDesc: "A premium fabric pouch featuring delicate hand-painted elephant motifs and fine stitching.",
    origin: "Crafted in Rajasthan",
    mainImage: "images/items/Vibrant folk-art elephant pouch design.jpg",
    thumbnails: [
      "images/items/Vibrant folk-art elephant pouch design.jpg"
    ]
  },
  {
    id: "zardozi-double-elephant",
    title: "Double Side Elephant (Mehroon)",
    category: "zardozi",
    price: 480,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviews: 21,
    tag: "Zardozi",
    shortDesc: "Mehroon Zardozi elephant ornament with traditional metallic embroidery on both sides.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/Intricate Zardozi elephant ornament on velvet.jpg",
    thumbnails: [
      "images/items/Intricate Zardozi elephant ornament on velvet.jpg"
    ]
  },
  {
    id: "zardozi-elephant",
    title: "Single Side Elephant",
    category: "zardozi",
    price: 380,
    oldPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 19,
    tag: "Zardozi",
    shortDesc: "Intricately embroidered Zardozi elephant, available in vibrant Red, Green, or Blue.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/Red Elephant( Zardozi).png",
    thumbnails: [
      "images/items/Red Elephant( Zardozi).png"
    ]
  },
  {
    id: "zardozi-camel",
    title: "Single Side Camel",
    category: "zardozi",
    price: 360,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 15,
    tag: "Zardozi",
    shortDesc: "Classic Rajasthani camel motif, rendered in shimmering Zardozi metallic threads.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/Green and gold camel ornament.png",
    thumbnails: [
      "images/items/Green and gold camel ornament.png"
    ]
  },
  {
    id: "zardozi-carrot",
    title: "Single Side Carrot",
    category: "zardozi",
    price: 360,
    oldPrice: null,
    discount: null,
    rating: 4.6,
    reviews: 9,
    tag: "Zardozi",
    shortDesc: "Playful carrot design brought to life with intricate and sparkling Zardozi craft.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/Beaded carrot ornament close-up.png",
    thumbnails: [
      "images/items/Beaded carrot ornament close-up.png"
    ]
  },
  {
    id: "zardozi-elephant-trunk",
    title: "Elephant with Trunk",
    category: "zardozi",
    price: 360,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviews: 31,
    tag: "Zardozi",
    shortDesc: "Detailed elephant with raised trunk, heavily embroidered with authentic gold threads.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/Green and gold elephant ornament.jpg",
    thumbnails: [
      "images/items/Green and gold elephant ornament.jpg"
    ]
  },
  {
    id: "zardozi-tiger",
    title: "Tiger (Orange)",
    category: "zardozi",
    price: 430,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 24,
    tag: "Zardozi",
    shortDesc: "A fierce orange tiger motif, capturing the spirit of India's wildlife in Zardozi.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/ChatGPT Image Apr 13, 2026, 06_11_51 PM.jpg",
    thumbnails: [
      "images/items/ChatGPT Image Apr 13, 2026, 06_11_51 PM.jpg"
    ]
  },
  {
    id: "zardozi-tuk-tuk",
    title: "Tuk-tuk",
    category: "zardozi",
    price: 380,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviews: 58,
    tag: "Zardozi",
    shortDesc: "A charming Indian auto rickshaw (Tuk-tuk) in yellow or sky blue, hand-embroidered.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/Beaded auto-rickshaw ornaments in vibrant colours.jpg",
    thumbnails: [
      "images/items/Beaded auto-rickshaw ornaments in vibrant colours.jpg"
    ]
  },
  {
    id: "zardozi-coin-purse",
    title: "Coin Purse",
    category: "zardozi",
    price: 660,
    oldPrice: 850,
    discount: "22% OFF",
    rating: 4.8,
    reviews: 17,
    tag: "Zardozi",
    shortDesc: "Premium Zardozi coin purse adorned with majestic elephant embroidery.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/Intricate Zardozi embroidered elephant pouches.jpg",
    thumbnails: [
      "images/items/Intricate Zardozi embroidered elephant pouches.jpg"
    ]
  },
  {
    id: "zardozi-halloween",
    title: "Halloween Design",
    category: "zardozi",
    price: 360,
    oldPrice: null,
    discount: null,
    rating: 4.5,
    reviews: 8,
    tag: "Zardozi",
    shortDesc: "A unique fusion of traditional Zardozi embroidery with a playful Halloween motif.",
    origin: "Crafted in Bareilly, Uttar Pradesh",
    mainImage: "images/items/halloween pumpkin.png",
    thumbnails: [
      "images/items/halloween pumpkin.png"
    ]
  }
];

window.products = products;

// Helper to resolve/correct product images (handling extension mismatches and missing references from backend/API)
window.resolveProductImage = function(imgUrl, productTitleOrId) {
  const placeholderSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eaeaea%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23999%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";
  if (!imgUrl) return placeholderSvg;
  
  let url = imgUrl.replace(/\\/g, '/');

  // Check for Tiger (Orange)
  const isTiger = 
    (productTitleOrId && String(productTitleOrId).toLowerCase().includes('tiger')) ||
    url.toLowerCase().includes('tiger') ||
    url.toLowerCase().includes('zardozi-tiger');

  if (isTiger) {
    return 'images/items/ChatGPT Image Apr 13, 2026, 06_11_51 PM.jpg';
  }

  // Extension mappings
  const mapping = {
    'vibrant folk-art elephant pouch design.png': 'Vibrant folk-art elephant pouch design.jpg',
    'beaded auto-rickshaw ornaments in vibrant colours.png': 'Beaded auto-rickshaw ornaments in vibrant colours.jpg',
    'intricate zardozi elephant ornament on velvet.png': 'Intricate Zardozi elephant ornament on velvet.jpg',
    'green and gold elephant ornament.png': 'Green and gold elephant ornament.jpg',
    'intricate zardozi embroidered elephant pouches.png': 'Intricate Zardozi embroidered elephant pouches.jpg',
    'sunflower.jpg.jpeg': 'Sunflower.jpg.jpeg',
    'wooden dice and wooden die holder.jpg.jpeg': 'Wooden dice and wooden die holder.jpg.jpeg'
  };

  const urlLower = url.toLowerCase();
  for (const [pngFile, jpgFile] of Object.entries(mapping)) {
    if (urlLower.endsWith(pngFile)) {
      return url.substring(0, url.length - pngFile.length) + jpgFile;
    }
  }

  return url;
};

