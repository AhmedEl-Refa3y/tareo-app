import express from "express";
import {
  registerPushToken,
  unregisterPushToken,
  updateNotificationSettings,
  getNotificationSettings,
  sendTestNotification,
} from "../../controllers/notificationController";
import { protect } from "../../middleware/auth";

const router = express.Router();

router.use(protect);

router.post("/register-token", registerPushToken);
router.post("/unregister-token", unregisterPushToken);
router.get("/settings", getNotificationSettings);
router.put("/settings", updateNotificationSettings);
router.post("/test", sendTestNotification);

export default router;
