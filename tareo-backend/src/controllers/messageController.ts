import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Message from "../models/Message";
import Session from "../models/Session";
import notificationService from "../services/notificationService";
import { logger } from "../utils/logger";

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, before } = req.query;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    const isAuthorized =
      session.patientId.toString() === req.user?._id.toString() ||
      session.doctorId?.toString() === req.user?._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const query: any = { sessionId };
    if (before) query.createdAt = { $lt: new Date(before as string) };

    const messages = await Message.find(query)
      .populate("senderId", "firstName lastName role profileImage")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Mark messages as read
    await Message.updateMany(
      { sessionId, senderId: { $ne: req.user?._id }, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    res.json({
      success: true,
      data: messages.reverse(),
      hasMore: messages.length === Number(limit),
    });
  } catch (error) {
    logger.error("Get messages error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, content } = req.body;

    const session = await Session.findById(sessionId)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Session is not active" });
    }

    const senderType = req.user?.role === "doctor" ? "doctor" : "patient";
    const message = await Message.create({
      sessionId,
      senderId: req.user?._id,
      senderType,
      content: content.trim(),
    });

    const populatedMessage = await message.populate(
      "senderId",
      "firstName lastName role profileImage",
    );

    // Send notification to recipient
    const recipientId =
      senderType === "doctor"
        ? session.patientId._id.toString()
        : session.doctorId?._id.toString();

    if (recipientId) {
      await notificationService.sendNewMessageNotification(
        recipientId,
        `${req.user?.firstName} ${req.user?.lastName}`,
        sessionId,
      );
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    logger.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await Message.updateMany(
      { sessionId, senderId: { $ne: req.user?._id }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    res.json({ success: true, data: { markedCount: result.modifiedCount } });
  } catch (error) {
    logger.error("Mark as read error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark messages as read" });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await Session.find({
      $or: [{ patientId: req.user?._id }, { doctorId: req.user?._id }],
    });
    const sessionIds = sessions.map((s) => s._id);
    const unreadCount = await Message.countDocuments({
      sessionId: { $in: sessionIds },
      senderId: { $ne: req.user?._id },
      isRead: false,
    });
    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    logger.error("Get unread count error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get unread count" });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    if (message.senderId.toString() !== req.user?._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    await message.deleteOne();
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    logger.error("Delete message error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete message" });
  }
};
