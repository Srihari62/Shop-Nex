import { Request, Response, NextFunction } from "express";
import {
  validateRegistrationData,
  checkOtpRestrictions,
  trackOtpRequests,
  sendOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
//new user registration

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existinguser = await prisma.users.findUnique({
      where: { email },
    });

    if (existinguser) {
      return next(new ValidationError("User with this email already exists"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to your email for verification",
    });
  } catch (error) {
    return next(error);
  }
};

//Verify user with otp
export const verifyUserOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(
        new ValidationError("Email, OTP, password and name are required")
      );
    }
    const existinguser = await prisma.users.findUnique({
      where: { email },
    });
    if (existinguser) {
      return next(new ValidationError("User with this email already exists"));
    }
    await verifyOtp(email, otp, next);
    const hashedPassword = bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        password: await hashedPassword,
      },
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};
