import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
import { NotFoundError } from "@packages/error-handler";

export const getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.orders.findMany({
      select: {
        id: true,
        total: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payment = await prisma.orders.findUnique({
      where: { id },
      include: {
        users: true,
        shops: true,
      },
    });

    if (!payment) {
      return next(new NotFoundError("Payment record not found"));
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
