import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Session from "../models/Session";
import Message from "../models/Message";
import Feedback from "../models/Feedback";
import User from "../models/User";
import { logger } from "../utils/logger";

export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = "month" } = req.query;
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const sessions = await Session.find({
      patientId: req.user?._id,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    const messagesCount = await Message.countDocuments({
      sessionId: { $in: sessions.map((s) => s._id) },
      senderId: req.user?._id,
    });

    const averageRating = await Feedback.aggregate([
      { $match: { userId: req.user?._id } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    // Daily activity
    const dailyActivity = sessions.reduce((acc: any, session) => {
      const date = session.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Session type distribution
    const sessionTypes = sessions.reduce((acc: any, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalSessions: sessions.length,
        totalMessages: messagesCount,
        averageRating: averageRating[0]?.avg || 0,
        dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
          date,
          count,
        })),
        sessionTypes,
        sessionsOverTime: sessions.map((s) => ({
          date: s.createdAt,
          type: s.type,
          duration: s.duration,
          status: s.status,
        })),
      },
    });
  } catch (error) {
    logger.error("Get user analytics error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};

export const getDoctorAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = "month" } = req.query;
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const sessions = await Session.find({
      doctorId: req.user?._id,
      createdAt: { $gte: startDate },
    });

    const uniquePatients = await Session.distinct("patientId", {
      doctorId: req.user?._id,
      createdAt: { $gte: startDate },
    });

    const averageRating = await Session.aggregate([
      {
        $match: {
          doctorId: req.user?._id,
          rating: { $exists: true },
          createdAt: { $gte: startDate },
        },
      },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalSessions: sessions.length,
        completedSessions: sessions.filter((s) => s.status === "completed")
          .length,
        uniquePatients: uniquePatients.length,
        averageDuration:
          sessions.reduce((acc, s) => acc + (s.duration || 0), 0) /
          (sessions.length || 1),
        averageRating: averageRating[0]?.avg || 0,
        sessionsByType: {
          chat: sessions.filter((s) => s.type === "chat").length,
          video: sessions.filter((s) => s.type === "video").length,
        },
        sessionsByStatus: {
          pending: sessions.filter((s) => s.status === "pending").length,
          active: sessions.filter((s) => s.status === "active").length,
          completed: sessions.filter((s) => s.status === "completed").length,
          cancelled: sessions.filter((s) => s.status === "cancelled").length,
        },
      },
    });
  } catch (error) {
    logger.error("Get doctor analytics error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};

export const getSystemAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const end = endDate ? new Date(endDate as string) : new Date();

    const [
      totalUsers,
      totalDoctors,
      newUsers,
      totalSessions,
      completedSessions,
      averageRating,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Session.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Session.countDocuments({
        status: "completed",
        createdAt: { $gte: start, $lte: end },
      }),
      Session.aggregate([
        {
          $match: {
            rating: { $exists: true },
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    // 📊 sessions trend (for chart)
    const sessionsTrend = await Session.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 📊 users growth (for chart)
    const usersTrend = await User.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const completionRate = totalSessions
      ? (completedSessions / totalSessions) * 100
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDoctors,
          totalSessions,
          newUsers,
          averageRating: averageRating[0]?.avg || 0,
          completionRate: Number(completionRate.toFixed(1)),
        },

        charts: {
          sessionsTrend,
          usersTrend,
        },

        period: { start, end },
      },
    });
  } catch (error) {
    logger.error("Get system analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};
