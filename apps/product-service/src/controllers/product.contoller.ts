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

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        slug : req.params.slug!
      },
      include : {
        images: true,
        shop: true
      }
    })
    res.status(200).json({
      success:true,
      product
    })
  } catch (error) {
    return next(error)
  }
}

export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange,
      colors = [],
      sizes = [],
      categories = [],
      page = 1,
      limit = 12,
      sort = "newest",
      q = ""
    } = req.query;
    
    const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(',').map(Number) : [0, 1000000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      isDeleted: false,
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      }
    };

    // Add search query filter
    if (q) {
      filters.OR = [
        { title: { contains: String(q), mode: "insensitive" } },
        { description: { contains: String(q), mode: "insensitive" } },
        { tags: { has: String(q) } }
      ];
    }

    if (categories && (Array.isArray(categories) ? categories.length > 0 : String(categories).length > 0)) {
      filters.category = {
        in: Array.isArray(categories) ? categories : String(categories).split(",")
      };
    }
    
    if (colors && (Array.isArray(colors) ? colors.length > 0 : String(colors).length > 0)) {
      filters.colors = {
        hasEvery: Array.isArray(colors) ? colors : String(colors).split(",")
      };
    }
    
    if (sizes && (Array.isArray(sizes) ? sizes.length > 0 : String(sizes).length > 0)) {
      filters.sizes = {
        hasEvery: Array.isArray(sizes) ? sizes : String(sizes).split(",")
      };
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { sale_price: "asc" };
    if (sort === "price_desc") orderBy = { sale_price: "desc" };
    if (sort === "popular") orderBy = { ratings: "desc" };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true
        },
        where: filters,
        orderBy
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);
    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      }
    });
    
  } catch (error) {
    return next(error);
  }
}

export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange,
      colors = [],
      sizes = [],
      categories = [],
      page = 1,
      limit = 12,
      sort = "newest",
      q = ""
    } = req.query;
    
    const parcedPriceRange = typeof priceRange === "string" ? priceRange.split(',').map(Number) : [0, 1000000];
    const parcedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parcedPage-1) * parsedLimit;

    const now = new Date();
    const filters: Record<string,any> = {
      isDeleted: false,
      sale_price : {
        gte : parcedPriceRange[0],
        lte : parcedPriceRange[1],
      },
      starting_date: { lte: now },
      ending_date: { gte: now },
    }

    if (q) {
      filters.OR = [
        { title: { contains: String(q), mode: "insensitive" } },
        { description: { contains: String(q), mode: "insensitive" } },
        { tags: { has: String(q) } }
      ];
    }

    if(categories && (Array.isArray(categories) ? categories.length > 0 : String(categories).length > 0)) {
      filters.category = {
        in: Array.isArray(categories) ? categories : String(categories).split(",")
      }
    }
    if(colors && (Array.isArray(colors) ? colors.length > 0 : String(colors).length > 0)) {
      filters.colors = {
        hasEvery: Array.isArray(colors) ? colors : String(colors).split(",")
      }
    }
    if(sizes && (Array.isArray(sizes) ? sizes.length > 0 : String(sizes).length > 0)) {
      filters.sizes = {
        hasEvery: Array.isArray(sizes) ? sizes : String(sizes).split(",")
      }
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { sale_price: "asc" };
    if (sort === "price_desc") orderBy = { sale_price: "desc" };
    if (sort === "popular") orderBy = { ratings: "desc" };


    const [products,total] = await Promise.all([
      prisma.products.findMany({
        skip,
        take:parsedLimit,
        include : {
          images: true,
          shop: true
        },
        where: filters,
        orderBy
      }),
      prisma.products.count({where: filters}),
    ])

    const totalPages = Math.ceil(total / parsedLimit);
    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parcedPage,
        totalPages,
      },
    });

    
  } catch (error) {
    
  }
}

export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12, q = "" } = req.query;
    const parcedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parcedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (q) {
      filters.OR = [
        { name: { contains: String(q), mode: "insensitive" } },
        { bio: { contains: String(q), mode: "insensitive" } },
        { description: { contains: String(q), mode: "insensitive" } },
      ];
    }


    if(categories && (categories as string[]).length > 0 ) {
      filters.category = {
        in: Array.isArray(categories) ? categories : String(categories).split(",")
      }
    }
    if(countries && (countries as string[]).length > 0 ) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(",")
      }
    }

    const [shops,total] = await Promise.all([
      prisma.shops.findMany({
        skip,
        take:parsedLimit,
        include : {
          sellers: true,
          // followers: true,
          products: true,
        },
        where: filters,
      }),
      prisma.shops.count({where: filters}),
    ])

    const totalPages = Math.ceil(total / parsedLimit);
    res.status(200).json({
      success: true,
      shops,
      pagination: {
        total,
        page: parcedPage,
        totalPages,
      },
    });

    
  } catch (error) {
    
  }
}

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const query = req.query.q as string
    if (!query || query.trim().length === 0 ) {
      res.status(400).json({
        success:false,
        message:"Search Query is required"
      })
    }
    const products = await prisma.products.findMany({
      where : {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            description: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
      },
      select : {
        id : true,
        title:true,
        slug:true
      },
      take: 10,
      orderBy: {
        createdAt: "desc"
      }
    })

    res.status(200).json({
      success:true,
      products,
    })

  } catch (error) {
    
  }
}

export const getTopShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const topShopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum : {
        total:true
      },
      orderBy :{
        _sum : {
          total: "desc"
        }
      },
      take:10
    })
    const shopIds = topShopsData.map((item:any) => item.shopId)
    const shops = await prisma.shops.findMany({
      where: {
        id : {
          in: shopIds
        }
      },
      select: {
        id : true,
        name: true,
        avatar: true,
        coverBanner : true,
        address : true,
        ratings: true,
        followers: true,
        category:true,
        
      }
    })

    const enrichedShops = shops.map((shop:any) => {
      const salesData = topShopsData.find((item:any) => item.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    const top10Shops = enrichedShops.sort((a:any,b:any) => b.totalSales - a.totalSales).slice(0,10)

    res.status(200).json({
      success:true,
      shops: top10Shops,
    })
  } catch (error) {
    console.error("Error fetching top shops:", error);
    return next(error)
  }
}