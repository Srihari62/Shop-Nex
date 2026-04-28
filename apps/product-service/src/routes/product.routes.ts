import express, { Router } from "express";
import { createDiscountCode, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllProducts, getCategories, getDiscountCodes, getFilteredEvents, getFilteredProducts, getFilteredShops, getProductDetails, getShopProducts, getTopShops, restoreProduct, searchProducts, uploadProductImage } from "../controllers/product.contoller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code",isAuthenticated,createDiscountCode)
router.get("/get-discount-codes",isAuthenticated,getDiscountCodes)
router.delete("/delete-discount-code/:id",isAuthenticated,deleteDiscountCode)

router.post("/upload-product-image",isAuthenticated,uploadProductImage)
router.delete("/delete-product-image",isAuthenticated,deleteProductImage)

//product
router.post("/create-product",isAuthenticated,createProduct)
router.get("/get-shop-products",isAuthenticated,getShopProducts)
router.put("/restore-product/:productId",isAuthenticated,restoreProduct)
router.delete("/delete-product/:productId",isAuthenticated,deleteProduct)
router.get("/get-all-products",getAllProducts)
router.get("/get-product/:slug",getProductDetails)
router.get("/get-filtered-products",getFilteredProducts)
router.get("/get-filtered-offers",getFilteredEvents)
router.get("/get-filtered-shops",getFilteredShops)
router.get("/search-products",searchProducts)
router.get("/top-shops",getTopShops)
export default router;
