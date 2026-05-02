import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User, { UserRole } from "../models/User";
import Session from "../models/Session";
import { logger } from "../utils/logger";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, page = 1, limit = 20, isActive } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password -passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const sessionsCount = await Session.countDocuments({ patientId: user._id });
    const completedSessions = await Session.countDocuments({
      patientId: user._id,
      status: "completed",
    });

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        stats: { sessionsCount, completedSessions },
      },
    });
  } catch (error) {
    logger.error("Get user by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, phone, role, specialty, isActive } =
      req.body;

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone, role, specialty, isActive },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user._id.toString() === req.user?._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete your own account" });
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    logger.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

export const createDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      specialty,
      licenseNumber,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const doctor = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: UserRole.DOCTOR,
      specialty,
      licenseNumber,
      isEmailVerified: true,
    });

    res.status(201).json({
      success: true,
      data: {
        id: doctor._id,
        firstName,
        lastName,
        email,
        doctorId: doctor.doctorId,
        specialty,
      },
    });
  } catch (error) {
    logger.error("Create doctor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create doctor" });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
      message: `User ${isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    logger.error("Toggle user status error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user status" });
  }
};

export const getDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await User.find({ role: UserRole.DOCTOR, isActive: true })
      .select("firstName lastName doctorId specialty profileImage")
      .sort({ firstName: 1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    logger.error("Get doctors error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch doctors" });
  }
};
