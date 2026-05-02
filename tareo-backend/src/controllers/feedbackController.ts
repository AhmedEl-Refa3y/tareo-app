import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Feedback from "../models/Feedback";
import Session from "../models/Session";
import { logger } from "../utils/logger";

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, rating, comment, category } = req.body;

    const feedback = await Feedback.create({
      userId: req.user?._id,
      sessionId: sessionId || null,
      rating,
      comment,
      category: category || "general",
    });

    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, { rating, feedback: comment });
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    logger.error("Submit feedback error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit feedback" });
  }
};

export const getMyFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const feedback = await Feedback.find({ userId: req.user?._id })
      .populate("sessionId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (error) {
    logger.error("Get my feedback error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch feedback" });
  }
};

export const getAllFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const feedback = await Feedback.find(query)
      .populate("userId", "firstName lastName email role")
      .populate("sessionId")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Feedback.countDocuments(query);
    res.json({
      success: true,
      data: feedback,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Get all feedback error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch feedback" });
  }
};

export const updateFeedbackStatus = async (req: AuthRequest, res: Response) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!feedback) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }
    res.json({ success: true, data: feedback });
  } catch (error) {
    logger.error("Update feedback status error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update feedback status" });
  }
};

export const getFeedbackStats = async (req: AuthRequest, res: Response) => {
  try {
    const averageRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      success: true,
      data: {
        averageRating: averageRating[0]?.avg || 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    logger.error("Get feedback stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch feedback stats" });
  }
};
