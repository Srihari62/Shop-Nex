import prisma from "@packages/libs/prisma";
import { NextFunction, Response, Request } from "express";

// Get Product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res
        .status(404)
        .json({ message: "Site configuration for categories not found" });
    }
    return res.status(200).json(config);
  } catch (error) {
    return next(error);
  }
};
