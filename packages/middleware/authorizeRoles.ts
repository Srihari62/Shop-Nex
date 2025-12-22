import { AuthenticationError } from "@packages/error-handler";
import { NextFunction, Response } from "express";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new AuthenticationError("Access denied. Seller access only."));
  }
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthenticationError("Access denied. User access only."));
  }
};
