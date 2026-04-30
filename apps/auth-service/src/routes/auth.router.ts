import express, { Router } from "express";
import {
  addUserAddress,
  createShop,
  createStripeConnectLink,
  deleteUserAddress,
  getSeller,
  getUser,
  getUserAddresses,
  loginSeller,
  loginUser,
  logout,
  refreshToken,
  registerSeller,
  resetUserPassword,
  updateUserAddress,
  updateUserPassword,
  updateUserProfile,
  userForgotPassword,
  userRegistration,
  verifySellerOtp,
  verifyUserForgotPassword,
  verifyUserOtp,
} from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
// import { isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUserOtp);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", resetUserPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPassword);

//seller
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySellerOtp);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, getSeller);

//address
router.post("/add-address", isAuthenticated, addUserAddress)
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress)
router.put("/update-address", isAuthenticated, updateUserAddress)
router.get("/shipping-addresses", isAuthenticated, getUserAddresses)
router.put("/update-profile", isAuthenticated, updateUserProfile);
router.put("/update-password", isAuthenticated, updateUserPassword);
router.get("/logout", logout);

export default router;
