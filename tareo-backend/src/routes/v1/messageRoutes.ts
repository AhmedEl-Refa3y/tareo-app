import express from "express";
import {
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage,
} from "../../controllers/messageController";
import { protect } from "../../middleware/auth";
import { validate, sendMessageValidation } from "../../middleware/validation";

const router = express.Router();

router.use(protect);

router.get("/unread/count", getUnreadCount);
router.get("/:sessionId", getMessages);
router.post("/", validate(sendMessageValidation), sendMessage);
router.put("/:sessionId/read", markAsRead);
router.delete("/:id", deleteMessage);

export default router;
