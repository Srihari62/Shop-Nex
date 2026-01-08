import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Garden",
            "Health & Beauty",
            "Sports & Outdoors",
            "Toys & Hobbies",
            "Automotive",
            "Books & Media",
            "Groceries & Gourmet Food",
            "Arts & Crafts",
          ],
          subCategories: {
            Electronics: [
              "Mobile Phones",
              "Laptops",
              "Cameras",
              "Televisions",
              "Audio Equipment",
            ],
            Fashion: ["Men", "Women", "Kids", "Accessories"],
            "Home & Garden": [
              "Furniture",
              "Kitchen & Dining",
              "Bedding",
              "Garden Tools",
            ],
            "Health & Beauty": [
              "Skincare",
              "Makeup",
              "Haircare",
              "Vitamins & Supplements",
            ],
            "Sports & Outdoors": [
              "Fitness Equipment",
              "Outdoor Gear",
              "Cycling",
              "Team Sports",
            ],
            "Toys & Hobbies": [
              "Action Figures",
              "Dolls",
              "Puzzles",
              "Board Games",
            ],
            Automotive: [
              "Car Electronics",
              "Replacement Parts",
              "Tires & Wheels",
              "Tools & Equipment",
            ],
            "Books & Media": ["Fiction", "Non-Fiction", "Magazines", "Comics"],
            "Groceries & Gourmet Food": [
              "Snacks",
              "Beverages",
              "Organic Foods",
              "International Foods",
            ],
            "Arts & Crafts": [
              "Painting Supplies",
              "Craft Kits",
              "Sewing",
              "Scrapbooking",
            ],
          },
        },
      });
    }
  } catch (err) {
    console.error("Error initializing site configuration:", err);
  }
};

export default initializeSiteConfig;
