import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import notificationService from "../services/notificationService";
import { logger } from "../utils/logger";

export const registerPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user?._id, {
      $addToSet: { notificationTokens: token },
    });
    res.json({ success: true, message: "Push token registered" });
  } catch (error) {
    logger.error("Register push token error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to register push token" });
  }
};

export const unregisterPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user?._id, {
      $pull: { notificationTokens: token },
    });
    res.json({ success: true, message: "Push token unregistered" });
  } catch (error) {
    logger.error("Unregister push token error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to unregister push token" });
  }
};

export const updateNotificationSettings = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { pushEnabled, emailNotifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { pushEnabled, emailNotifications },
      { new: true },
    );
    res.json({
      success: true,
      data: {
        pushEnabled: user?.pushEnabled,
        emailNotifications: user?.emailNotifications,
      },
    });
  } catch (error) {
    logger.error("Update notification settings error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update notification settings",
      });
  }
};

export const getNotificationSettings = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const user = await User.findById(req.user?._id);
    res.json({
      success: true,
      data: {
        pushEnabled: user?.pushEnabled,
        emailNotifications: user?.emailNotifications,
      },
    });
  } catch (error) {
    logger.error("Get notification settings error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get notification settings" });
  }
};

export const sendTestNotification = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.sendPushNotification(
      req.user?._id.toString(),
      "Test Notification",
      "This is a test notification from TAREO",
      { type: "test" },
    );
    res.json({ success: true, message: "Test notification sent" });
  } catch (error) {
    logger.error("Send test notification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send test notification" });
  }
};
