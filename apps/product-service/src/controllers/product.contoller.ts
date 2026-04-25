import { AuthenticationError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
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

//Create Product 

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;

    if(!title || !slug || !description  || !category || !stock || !sale_price || !regular_price || !subCategory || !images || !tags){
      return next(new ValidationError("Missing Required Fields",400))
    }
    if(!req.seller.id) {
      return next(new AuthenticationError("Only Seller can create proucts"))
    }

    const slugChecking = await prisma.products.findUnique({
      where:{
        slug,
      }
    })
    if(slugChecking){
      return next(new ValidationError("Slug already exist please use a different slug",400))
    }

    const newProduct = await prisma.products.create({
      data:{
        title,
        slug,
        description,
        detailed_description,
        warranty,
        cash_on_delivery: cash_on_delivery === "yes" ? true : false,
        shopId: req.seller?.shop?.id!,
        tags : Array.isArray(tags) ? tags : tags.split(","),
        custom_specifications : custom_specifications || {},
        brand,
        video_url,
        category,
        subCategory,
        images: {
          create: images.filter((img:any) => img && img.fileId && img.file_url).map((image:any) => ({
          file_id: image.fileId,
          url: image.file_url,
        })),
        },
        colors : colors || [],
        sizes : sizes || [],
        discount_codes: discountCodes.map((codeId:string) => codeId),
        stock : parseInt(stock),
        sale_price:parseFloat(sale_price),
        regular_price:parseFloat(regular_price),
        customProperties: customProperties || {},
        sellerId: req.seller.id,
      },
      include : {
        images : true
      }
    })

    res.status(201).json({
      success:true,
      message:"Product Created successfully",
      newProduct
    });
  } catch (error) {
    return next(error)
  }
}

//get loggedin seller products

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id
      },
      include: {
        images: true
      }
    })
    res.status(200).json({
      success:true,
      products
    })
  } catch (error) { 
    return next(error)
  }
}

//delete product

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {productId} = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      where: {
        id:productId
      },
      select: {id:true, shopId:true,isDeleted:true}
    })
    if(!product){
      return next(new ValidationError("Product not found",404))
    }
    if(product.shopId !== sellerId){
      return next(new ValidationError("You are not authorized to delete this product",403))
    }
    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted",400))
    }    

    const deletedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now()+ 24*60*60*1000),
      }
    })

 res.status(200).json({
      success:true,
      message:"Product is scheduled for deletion in 24hrs, You can restore this product within 24hrs",
      deletedAt: deletedProduct.deletedAt
    })
  } catch (error) {
    return next(error)
  }
}

// Restore Product

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {productId} = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      where: {
        id:productId
      },
      select: {id:true, shopId:true,isDeleted:true}
    })
    if(!product){
      return next(new ValidationError("Product not found",404))
    }
    if(product.shopId !== sellerId){
      return next(new ValidationError("You are not authorized to restore this product",403))
    }
    if (!product.isDeleted) {
      return next(new ValidationError("Product is already active",400))
    }    

    await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      }
    })
    res.status(200).json({
      success:true,
      message:"Product restored successfully",
    })
  } catch (error) {
    return next(error)
  }
}

//get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query?.type as string;

    const baseFilter = {
      isDeleted: false,
    }

    const orderBy: Prisma.productsOrderByWithRelationInput = 
    type === "latest" ? {createdAt:"desc" as Prisma.SortOrder} : {ratings:"desc" as Prisma.SortOrder}

    const [products,total,top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take:limit,
        include : {
          images: true,
          shop: true
        },
        where: baseFilter,
        orderBy: {
          ratings: "desc"
        }
      }),
      prisma.products.count({where: baseFilter}),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy
      })
    ])

    res.status(200).json({
      products,
      top10By: type === 'latest' ? 'latest' : 'topRatings',
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total/limit)
    })
  } catch (error) { 
    return next(error)
  }
}

