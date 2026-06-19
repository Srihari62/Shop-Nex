import { Request, Response, NextFunction } from "express";
import {
  validateRegistrationData,
  checkOtpRestrictions,
  trackOtpRequests,
  sendOtp,
  verifyOtp,
  handleForgotPassword,
  verifyForgotPasswordOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthenticationError, NotFoundError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import { Stripe } from "stripe";
import { imagekit } from "@packages/libs/imagekit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

//new user registration
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existinguUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existinguUser) {
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
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
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

//Login User
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      return next(new AuthenticationError("User not found"));
    }
    //verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthenticationError("Invalid credentials"));
    }

    res.clearCookie("sellerAccessToken");
    res.clearCookie("sellerRefreshToken");
    //Generate Access Token and Refresh Token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_ACCESS_SECRET! as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_REFRESH_SECRET! as string,
      { expiresIn: "7d" }
    );

    //store refresh token and access token in httpOnly cookies
    setCookie(res, "accessToken", accessToken);
    setCookie(res, "refreshToken", refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//Refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies.sellerRefreshToken ||
      req.cookies.refreshToken ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return next(new ValidationError("No refresh token provided"));
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET! as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new ValidationError("Forbidden! Invalid refresh token"));
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthenticationError("Forbidden! User/Seller not found");
    }
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" }
    );

    if (decoded.role === "seller") {
      setCookie(res, "sellerAccessToken", newAccessToken);
      return res.status(201).json({ success: true });
    } else if (decoded.role === "user") {
      setCookie(res, "accessToken", newAccessToken);
    }
    console.log(decoded.role,"Role")
    req.role = decoded.role;
    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//get loggedin user info
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

//verify forgot password otp
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  verifyForgotPasswordOtp(req, res, next);
};

//reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required"));
    }
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      return next(new ValidationError("No user found with the provided email"));
    }
    //compare new password with old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password must be different from the old password"
        )
      );
    }
    //hash new password and update in DB
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

//register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");

    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(new ValidationError("Seller with this email already exists"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    res.status(200).json({
      message: "OTP sent to your email for verification",
    });
  } catch (error) {
    return next(error);
  }
};

//Verify seller with otp
export const verifySellerOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp || !password || !name || !country || !phone_number) {
      return next(
        new ValidationError(
          "Email, OTP, Password,Name,Phone Number, Country are required"
        )
      );
    }
    const existingSeller = await prisma.users.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Seller with this email already exists"));
    }
    await verifyOtp(email, otp, next);
    const hashedPassword = bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: await hashedPassword,
        phone_number,
        country,
      },
    });
    res.status(201).json({
      success: true,
      seller,
      message: "Seller registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//Create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError("All fields are required"));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
      message: "Shop Created successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//create a stripe connect link

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });
    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    //create stripe connect account
    const account = await stripe.accounts.create({
      type: "standard",
      country: "US",
      email: seller.email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding",
    });

    res.status(200).json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    return next(error);
  }
};

//Seller Login

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }
    const seller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (!seller) {
      return next(new AuthenticationError("Seller not found"));
    }
    //verify password
    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) {
      return next(new AuthenticationError("Invalid credentials"));
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    //Generate Access Token and Refresh Token
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.JWT_ACCESS_SECRET! as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.JWT_REFRESH_SECRET! as string,
      { expiresIn: "7d" }
    );

    //store refresh token and access token in httpOnly cookies
    setCookie(res, "sellerAccessToken", accessToken);
    setCookie(res, "sellerRefreshToken", refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",

      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get loggedin seller info
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = req.user;
    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};


export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("All fields are required"));
    }
   if (isDefault) {
    await prisma.address.updateMany({
      where: {
        userId,
        isDefault : true
      },
      data: {
        isDefault : false
      }
    })
   }
   const newAddress = await prisma.address.create({
    data: {
      label,
      name,
      street,
      city,
      zip,
      country,
      isDefault,
      userId
    }
   })
    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId ,userId},
    });
    if (!existingAddress) {
      return next(new NotFoundError("Address not found"));
    }
    await prisma.address.delete({
      where: { id: addressId },
    });
    res.status(201).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAddresses = async(
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc"
      }
    })
    res.status(201).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
}

export const updateUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId, label, name, street, city, zip, country, isDefault } = req.body;

    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return next(new NotFoundError("Address not found"));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
          NOT: { id: addressId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(200).json({
      success: true,
      address: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { name, avatar } = req.body;

    if (!userId) {
      return next(new AuthenticationError("User not found"));
    }

    const updateData: any = {};
    if (name) updateData.name = name;

    await prisma.$transaction(async (tx) => {
      // If avatar is provided (base64 string from client)
      if (avatar) {
        const response = await imagekit.upload({
          file: avatar,
          fileName: `avatar-${userId}-${Date.now()}.jpg`,
          folder: "/avatars",
        });

        // 1. Check if user already has an avatar record
        const currentUser = await tx.users.findUnique({
          where: { id: userId },
          select: { avatarId: true }
        });

        if (currentUser?.avatarId) {
          // Update existing image record
          await tx.images.update({
            where: { id: currentUser.avatarId },
            data: {
              url: response.url,
              file_id: response.fileId,
            },
          });
          updateData.avatarId = currentUser.avatarId;
        } else {
          // Create new image record and link it
          const newImage = await tx.images.create({
            data: {
              url: response.url,
              file_id: response.fileId,
            },
          });
          updateData.avatarId = newImage.id;
        }
      }

      await tx.users.update({
        where: { id: userId },
        data: updateData,
      });
    });

    const updatedUser = await prisma.users.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (updatedUser) {
      // Security: Remove password before sending to frontend
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: userWithoutPassword,
      });
    } else {
      res.status(404).json({ success: false, message: "User not found after update" });
    }
  } catch (error) {
    next(error);
  }
};

// Update Password
export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
      return next(new ValidationError("Current and new password are required"));
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AuthenticationError("User not found"));
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) {
      return next(new ValidationError("Incorrect current password", 400));
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(new ValidationError("New password cannot be same as old password", 400));
    }

    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req: any, res: Response, next: NextFunction) => {
  try {
    res.cookie("accessToken", "", { maxAge: 1 });
    res.cookie("refreshToken", "", { maxAge: 1 });
    res.cookie("sellerAccessToken", "", { maxAge: 1 });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// admin login

export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      return next(new AuthenticationError("User not found"));
    }
    //verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthenticationError("Invalid credentials"));
    }

    const isAdmin = user.role === "admin";
    if(!isAdmin){
      // sendLog({
      //   type: "error",
      //   message: `Unauthorized access attempt: ${user.name}`,
      //   source: "aut-service",
      // })
      return next(new ValidationError("You are not admin"));
    }
    
    // sendLog({
    //   type: "success",
    //   message: `Admin login successful: ${email}`,
    //   source: "auth-service",
    // });

    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

    const accessToken = jwt.sign({id: user.id, role:  "admin"}, process.env.JWT_ACCESS_SECRET as string, { expiresIn: "15m" });
    const refreshToken = jwt.sign({id: user.id, role: "admin"}, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
    setCookie(res,"accessToken",accessToken)
    setCookie(res,"refreshToken",refreshToken)
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user:{
        id: user.id,
        name: user.name,
        email: user.email,
      }
    })
    
  } catch (error) {
    next(error);
  }
};
