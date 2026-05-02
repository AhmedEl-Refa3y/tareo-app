import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Session from "../models/Session";
import User, { UserRole } from "../models/User";
import notificationService from "../services/notificationService";
import { logger } from "../utils/logger";

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { type, doctorId } = req.body;

    // If doctorId is not provided, assign a random available doctor
    let assignedDoctorId = doctorId;
    if (!assignedDoctorId) {
      const availableDoctor = await User.findOne({
        role: UserRole.DOCTOR,
        isActive: true,
      });
      if (availableDoctor) {
        assignedDoctorId = availableDoctor._id;
      }
    }

    const session = await Session.create({
      patientId: req.user?._id,
      doctorId: assignedDoctorId || null,
      type,
      status: "active",
      startedAt: new Date(),
    });

    await session.populate(
      "doctorId",
      "firstName lastName doctorId specialty profileImage",
    );
    await session.populate("patientId", "firstName lastName profileImage");

    if (assignedDoctorId) {
      await notificationService.sendPushNotification(
        assignedDoctorId.toString(),
        "New Session Started",
        `Patient ${req.user?.firstName} ${req.user?.lastName} started a ${type} session`,
        { type: "session", sessionId: session._id.toString() },
      );
    }

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    logger.error("Create session error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create session" });
  }
};

export const getMySessions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10000, status, type } = req.query;
    const query: any = { patientId: req.user?._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const sessions = await Session.find(query)
      .populate(
        "doctorId",
        "firstName lastName doctorId specialty profileImage",
      )
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Get my sessions error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch sessions" });
  }
};

export const getDoctorSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10000, status } = req.query;
    const query: any = { doctorId: req.user?._id };
    if (status) query.status = status;

    const sessions = await Session.find(query)
      .populate("patientId", "firstName lastName email phone profileImage")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Session.countDocuments(query);
    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Get doctor sessions error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch sessions" });
  }
};

export const getSessionById = async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("patientId", "firstName lastName email phone profileImage")
      .populate(
        "doctorId",
        "firstName lastName doctorId specialty profileImage",
      );

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    const isAuthorized =
      session.patientId._id.toString() === req.user?._id.toString() ||
      session.doctorId?._id.toString() === req.user?._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    logger.error("Get session by ID error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch session" });
  }
};

export const endSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.status === "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Session already ended" });
    }

    session.status = "completed";
    session.endedAt = new Date();
    session.duration = Math.floor(
      (new Date().getTime() - new Date(session.startedAt).getTime()) /
        1000 /
        60,
    );
    await session.save();

    await notificationService.sendFeedbackRequest(
      session.patientId.toString(),
      session._id.toString(),
    );

    res.json({ success: true, data: session });
  } catch (error) {
    logger.error("End session error:", error);
    res.status(500).json({ success: false, message: "Failed to end session" });
  }
};

export const getSessionStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalSessions = await Session.countDocuments({
      patientId: req.user?._id,
    });
    const completedSessions = await Session.countDocuments({
      patientId: req.user?._id,
      status: "completed",
    });
    const totalDuration = await Session.aggregate([
      { $match: { patientId: req.user?._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]);
    const averageRating = await Session.aggregate([
      { $match: { patientId: req.user?._id, rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        totalDuration: totalDuration[0]?.total || 0,
        averageRating: averageRating[0]?.avg || 0,
      },
    });
  } catch (error) {
    logger.error("Get session stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch session stats" });
  }
};

export const getDoctorStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalSessions = await Session.countDocuments({
      doctorId: req.user?._id,
    });
    const completedSessions = await Session.countDocuments({
      doctorId: req.user?._id,
      status: "completed",
    });
    const activeSessions = await Session.countDocuments({
      doctorId: req.user?._id,
      status: "active",
    });
    const totalPatients = await Session.distinct("patientId", {
      doctorId: req.user?._id,
    });

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        activeSessions,
        totalPatients: totalPatients.length,
        completionRate: totalSessions
          ? (completedSessions / totalSessions) * 100
          : 0,
      },
    });
  } catch (error) {
    logger.error("Get doctor stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch doctor stats" });
  }
};
