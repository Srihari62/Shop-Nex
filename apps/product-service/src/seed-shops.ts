import prisma from "../../../packages/libs/prisma/index";

async function seedShops() {
  console.log("Cleaning up existing data...");
  await prisma.products.deleteMany({});
  await prisma.shops.deleteMany({});


  const categories = [
    "Clothing", "Electronics", "Grocery", "Restaurant", "Beauty", 
    "Furniture", "Automotive", "Books", "Toys", "Sports", 
    "Hardware", "Pet", "Medical", "Jewelry", "Florist", 
    "Baby", "Art", "Music", "Technology", "Garden"
  ];

  const countries = ["Bangladesh", "USA", "UK", "India"];

  const shopNames = [
    "Becodemy", "Infricode", "Tech Haven", "Style Studio", "Green Grocer",
    "Gourmet Grill", "Beauty Box", "Living Loft", "Auto Ace", "Book Barn",
    "Toy Town", "Sport Sphere", "Tool Time", "Pet Pals", "Health Hub",
    "Gem Gallery", "Flower Fairy", "Baby Bliss", "Art Attic", "Melody Mart"
  ];

  for (let i = 0; i < shopNames.length; i++) {
    const email = `seller${i}@example.com`;
    
    // Create or find seller
    let seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      seller = await prisma.sellers.create({
        data: {
          name: `${shopNames[i]} Owner`,
          email,
          phone_number: `12345678${i}`,
          country: "Bangladesh",
          password: "password123", // In real app, hash this
        }
      });
    }

    // Create Shop
    const category = categories[i % categories.length];
    const country = countries[i % countries.length];
    await prisma.shops.upsert({
      where: { sellerId: seller.id },
      update: {
        name: shopNames[i],
        category,
        country,
        bio: `Welcome to ${shopNames[i]}, your best source for ${category}!`,
        address: `${600 + i} Banani, Dhaka, ${country}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shopNames[i]}`,
        coverBanner: `https://picsum.photos/seed/${shopNames[i]}/1200/400`,
        ratings: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        followers: Array.from({ length: Math.floor(Math.random() * 10) }).map((_, j) => `user-${j}`),
      },
      create: {
        name: shopNames[i],
        category,
        country,
        bio: `Welcome to ${shopNames[i]}, your best source for ${category}!`,
        address: `${600 + i} Banani, Dhaka, ${country}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shopNames[i]}`,
        coverBanner: `https://picsum.photos/seed/${shopNames[i]}/1200/400`,
        ratings: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        followers: Array.from({ length: Math.floor(Math.random() * 10) }).map((_, j) => `user-${j}`),
        sellerId: seller.id,
      }
    });


    if (i % 5 === 0) console.log(`Processed ${i} shops...`);
  }

  console.log("Shop seeding completed successfully!");
}

seedShops()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
