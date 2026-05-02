import express from "express";
import authRoutes from "./v1/authRoutes";
import userRoutes from "./v1/userRoutes";
import sessionRoutes from "./v1/sessionRoutes";
import messageRoutes from "./v1/messageRoutes";
import feedbackRoutes from "./v1/feedbackRoutes";
import knowledgeRoutes from "./v1/knowledgeRoutes";
import notificationRoutes from "./v1/notificationRoutes";
import analyticsRoutes from "./v1/analyticsRoutes";

const router = express.Router();

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/messages", messageRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/knowledge", knowledgeRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TAREO API is running",
    timestamp: new Date(),
    version: "1.0.0",
  });
});

export default router;
