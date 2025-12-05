import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];
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

    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    req.user = account;

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
