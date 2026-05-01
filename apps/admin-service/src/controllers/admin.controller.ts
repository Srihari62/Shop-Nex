import { Request, Response } from "express";
import prisma from "@packages/libs/prisma";

// --- USER CONTROLLERS ---
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        avatar: true
      }
    });
    res.status(200).json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.params.id },
      include: {
        avatar: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        shopReviews: true,
        followings: true
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Fetch address separately since it's a separate model referencing userId
    const userAddress = await prisma.address.findFirst({
        where: { userId: user.id, isDefault: true }
    });

    res.status(200).json({ success: true, user: { ...user, address: userAddress } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PRODUCT CONTROLLERS ---
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.products.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        shop: {
          select: { name: true, id: true, avatarUrl: true, avatar: true }
        },
        images: true
      }
    });
    res.status(200).json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.products.findUnique({
      where: { id: req.params.id },
      include: {
        shop: {
            include: { avatar: true }
        },
        images: true
      }
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SELLER (SHOP) CONTROLLERS ---
export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await prisma.shops.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sellers: {
          select: { name: true, email: true, id: true }
        },
        avatar: true,
        _count: {
          select: { products: true }
        }
      }
    });
    res.status(200).json({ success: true, sellers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerById = async (req: Request, res: Response) => {
  try {
    const seller = await prisma.shops.findUnique({
      where: { id: req.params.id },
      include: {
        sellers: true,
        avatar: true,
        followers: true,
        reviews: true,
        products: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { images: true }
        }
      }
    });
    if (!seller) return res.status(404).json({ message: "Seller/Shop not found" });
    res.status(200).json({ success: true, seller });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
