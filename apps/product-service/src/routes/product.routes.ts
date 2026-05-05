import express, { Router } from "express";
import { createDiscountCode, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, followShop, getAllProducts, getCategories, getDiscountCodes, getFilteredEvents, getFilteredOffers, getFilteredProducts, getFilteredShops, getProductDetails, getSellerShop, getShopDetails, getShopProducts, getTopShops, restoreProduct, searchProducts, unfollowShop, updateShop, uploadProductImage } from "../controllers/product.contoller";
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
router.get("/get-filtered-offers", getFilteredOffers)
router.get("/get-filtered-shops",getFilteredShops)
router.get("/get-shop/:id", getShopDetails)
router.get("/get-seller-shop", isAuthenticated, getSellerShop)
router.put("/update-shop", isAuthenticated, updateShop)
router.post("/follow-shop", isAuthenticated, followShop)
router.post("/unfollow-shop", isAuthenticated, unfollowShop)
router.get("/search-products",searchProducts)
router.get("/top-shops",getTopShops)
export default router;
