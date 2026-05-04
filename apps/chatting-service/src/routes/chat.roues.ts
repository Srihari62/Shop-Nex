import express from "express";
import {
  fetchSellerMessages,
  fetchUserMessages,
  getUserConversations,
  getSellerConversations,
  newConversation,
} from "../contollers/chatting.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router = express.Router();

router.post("/create-user-conversationGroup", isAuthenticated, newConversation);
router.get("/get-user-conversations", isAuthenticated, getUserConversations);
router.get(
  "/get-seller-conversations",
  isAuthenticated,
  isSeller,
  getSellerConversations,
);
router.get(
  "/get-user-messages/:conversationId",
  isAuthenticated,
  fetchUserMessages,
);
router.get(
  "/get-seller-messages/:conversationId",
  isAuthenticated,
  isSeller,
  fetchSellerMessages,
);

export default router;
