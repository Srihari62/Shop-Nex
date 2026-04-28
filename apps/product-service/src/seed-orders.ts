import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding orders...");

  const shops = await prisma.shops.findMany();
  if (shops.length === 0) {
    console.log("No shops found. Please seed shops first.");
    return;
  }

  // Clear existing orders
  await prisma.orders.deleteMany();

  // Create 50 random orders across shops
  for (let i = 0; i < 50; i++) {
    const shop = shops[Math.floor(Math.random() * shops.length)];
    const total = parseFloat((Math.random() * 500 + 20).toFixed(2));
    
    await prisma.orders.create({
      data: {
        userId: "60d5ec123456789012345678", // Dummy user ID
        shopId: shop.id,
        items: [
          {
            productId: "60d5ec123456789012345679", // Dummy product ID
            quantity: Math.floor(Math.random() * 3) + 1,
            price: total,
            title: "Sample Product"
          }
        ],
        total: total,
        status: "Delivered",
        paymentStatus: "Paid",
        paymentMethod: "Stripe",
        shippingAddress: {
          street: "123 Main St",
          city: "Dhaka",
          country: "Bangladesh"
        }
      }
    });
  }

  console.log("Order seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
