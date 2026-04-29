import { AuthenticationError } from "../error-handler";
import { NextFunction, Response } from "express";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
    console.log(req.role,"ROLEEEE");
  if (req.role !== "seller") {
    return next(new AuthenticationError("Access denied. Seller access only."));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthenticationError("Access denied. User access only."));
  }
  next();
};
