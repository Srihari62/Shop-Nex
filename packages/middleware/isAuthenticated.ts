import prisma from "../libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.cookies.sellerAccessToken ||
      req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token Missing.." });
    }

    //verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET! as string
    ) as { id: string; role: "user" | "seller" };

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized! Invalid Token.." });
    }

    req.role = decoded.role;
    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account;
    }
    if (!account) {
      return res.status(401).json({ message: "Account Not Found.." });
    }
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or invalid.." });
  }
};

export default isAuthenticated;
