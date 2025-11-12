import express, { Router } from "express";
import { userRegistration, verifyUserOtp } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUserOtp);
export default router;
