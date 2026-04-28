import prisma from "../../../packages/libs/prisma/index";

async function seed() {
  const shops = await prisma.shops.findMany();

  if (shops.length === 0) {
    console.error("No shops found. Please run seed-shops.ts first.");
    return;
  }


  const categories = [
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Health & Beauty",
    "Sports & Outdoors",
    "Toys & Games",
    "Automotive",
    "Books & Media",
  ];
  const colors = ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  console.log("Cleaning up existing products...");
  await prisma.products.deleteMany({});
  
  const productsCount = 100;
  console.log(`Seeding ${productsCount} products across ${shops.length} shops...`);

  for (let i = 1; i <= productsCount; i++) {
    const isOffer = i > 80; // 20 offers, 80 regular
    const category = categories[Math.floor(Math.random() * categories.length)];
    const title = `${category} Item ${i}`;
    const slug = `${title.toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${Math.random().toString(36).substring(7)}`;
    
    const basePrice = Math.floor(Math.random() * 500) + 10;
    const salePrice = isOffer ? basePrice : basePrice;
    const regularPrice = isOffer ? basePrice + Math.floor(Math.random() * 50) + 5 : basePrice;
    
    const productImages = Array.from({ length: 3 }).map((_, index) => ({
      file_id: `seed-${i}-${index}`,
      url: `https://picsum.photos/seed/${slug}-${index}/600/800`,
    }));

    const shop = shops[Math.floor(Math.random() * shops.length)];

    await prisma.products.create({
      data: {
        title,
        slug,
        category,
        subCategory: "Standard",
        sellerId: shop.sellerId,
        shopId: shop.id,
        description: `High quality ${title} perfect for your needs.`,
        detailed_description: `This is a long description for ${title}. It explains all the features and benefits of owning this product in great detail.`,
        stock: Math.floor(Math.random() * 50) + 5,
        sale_price: salePrice,
        regular_price: regularPrice,
        colors: [colors[Math.floor(Math.random() * colors.length)]],
        sizes: [sizes[Math.floor(Math.random() * sizes.length)]],
        tags: [category, isOffer ? "Offer" : "Regular", "New"],
        cash_on_delivery: true,
        starting_date: isOffer ? new Date() : null,
        ending_date: isOffer ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        customProperties: {},
        ratings: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        images: {
          create: productImages,
        },
      },
    });



    if (i % 10 === 0) console.log(`Created ${i} products...`);
  }

  console.log("Seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
