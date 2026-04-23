import { ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
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

//Create Discount Codes
export const createDiscountCode = async(
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {public_name,discountType,discountValue,discountCode} = req.body;
    if(!public_name || !discountType || !discountValue || !discountCode){
      return res.status(400).json({message:"All fields are required"})
    }
    const isDiscountCodeExist= await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });
    if(isDiscountCodeExist){
      return next(new ValidationError("Discount code already exist please use a different code",400))
    }
    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });
    res.status(201).json({
      success:true,
      message:"Discount Code Created successfully",
      discount_code
    });
  } catch (error) {
    return next(error);
  }
}

//Get Discount Codes
export const getDiscountCodes = async(
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });
    res.status(200).json({
      success:true,
      discount_codes
    });
  } catch (error) {
    return next(error);
  }
}

//Delete Discount Code
export const deleteDiscountCode = async(
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {id} = req.params;
    const sellerId = req.seller.id;
    const isDiscountCodeExist= await prisma.discount_codes.findUnique({
      where: {id},
      select: {id:true,sellerId:true}
    });
    if(!isDiscountCodeExist){
      return next(new ValidationError("Discount code not found",404))
    }
    if(isDiscountCodeExist.sellerId !== sellerId){
      return next(new ValidationError("You are not authorized to delete this discount code",403))
    }
    await prisma.discount_codes.delete({
      where: {
        id,
      },
    });
    res.status(200).json({
      success:true,
      message:"Discount Code Deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

//upload Product Images
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {fileName} = req.body;
    
    const response = await imagekit.upload(
      {file:fileName,
      fileName:`product-${Date.now()}.jpg`,
      folder: "/products"}
    )
    res.status(201).json({
      success:true,
      message:"Product Image Uploaded successfully",
      file_url: response.url,
      fileId: response.fileId
    })
  } catch (error) {
    return next(error)
  }
};

// Delete Product Images
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {fileId} = req.body;
    
    const response = await imagekit.deleteFile(fileId)
    res.status(200).json({
      success:true,
      message:"Product Image Deleted successfully",
      response
    })
  } catch (error) {
    return next(error)
  }
};
