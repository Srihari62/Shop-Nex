import crypto from "crypto";
import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
// import { parse } from "path";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields for registration");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Due to multiple failed attempts, you are temporarily blocked from requesting a new OTP. Please try again after 30min."
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "You have requested OTP multiple times in a short period. Please wait for 1 hour before requesting again."
      )
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError(
        "Please wait for a minute before requesting a new OTP."
      )
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); //lock 1 hr
    return next(
      new ValidationError(
        "You have requested OTP multiple times in a short period. Please wait for 1 hour before requesting again."
      )
    );
  }
  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); //tracking requests for 1 hr
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify your email", template, { name, otp });

  //store otp in redis with email and with expiry of 5 minutes

  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("OTP has expired. Please request a new one.");
  }
  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");
  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); //lock for 30 mins
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Too many failed attempts. You are temporarily blocked from requesting a new OTP. Please try again after 30min."
      );
    } else {
      await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300); //track failed attempts for 5 mins
      throw new ValidationError(
        `Invalid OTP. Please try again.You left with only ${
          2 - failedAttempts
        } attempts.`
      );
    }
  }
  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError("Email is required");
    }
    //find user / seller in DB
    const user =
      userType === "user" &&
      (await prisma.users.findUnique({
        where: { email },
      }));
    if (!user) {
      throw new ValidationError(`No ${userType} found with the provided email`);
    }
    //check otp restrictions
    await checkOtpRestrictions(email, next);
    //track otp requests
    await trackOtpRequests(email, next);
    //send otp email
    await sendOtp(user.name, email, "forgot-password-user-mail");

    res.status(200).json({
      message: "OTP sent to your email for password reset",
    });
  } catch (error) {
    return next(error);
  }
};
export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required");
    }
    await verifyOtp(email, otp, next);
    res.status(200).json({
      message: "OTP verified successfully, You can reset your password",
    });
  } catch (error) {
    next(error);
  }
};
