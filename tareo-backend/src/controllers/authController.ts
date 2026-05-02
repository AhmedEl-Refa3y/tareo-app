import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User, { UserRole } from "../models/User";
import VerificationCode from "../models/VerificationCode";
import emailService from "../services/emailService";
import tokenService from "../services/tokenService";
import { generateRandomCode } from "../utils/helpers";
import { logger } from "../utils/logger";
import { createHash } from "crypto";

// ================= NORMALIZE EMAIL =================
const normalizeEmail = (email: string) => {
  let e = email.trim().toLowerCase();

  if (e.includes("@gmail.com")) {
    const [local, domain] = e.split("@");
    const cleanLocal = local.replace(/\./g, "");
    return `${cleanLocal}@${domain}`;
  }

  return e;
};

// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      password,
      role: role || UserRole.PATIENT,
      isEmailVerified: false,
    });

    const verificationCode = generateRandomCode(6);

    await VerificationCode.create({
      email: normalizedEmail,
      code: verificationCode,
      type: "email",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await emailService.sendVerificationCode(normalizedEmail, verificationCode);

    res.status(201).json({
      success: true,
      message: "Verification code sent to your email",
      requiresVerification: true,
      email: user.email,
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const verification = await VerificationCode.findOne({
      email: normalizedEmail,
      code,
      type: "email",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    verification.isUsed = true;
    await verification.save();

    await emailService.sendWelcomeEmail(user.firstName, user.email);

    const token = tokenService.generateToken(user._id.toString());
    const refreshToken = tokenService.generateRefreshToken(user._id.toString());

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
};

// ================= RESEND VERIFICATION =================
export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // expire old codes
    await VerificationCode.updateMany(
      { email: normalizedEmail, type: "email", isUsed: false },
      { isUsed: true },
    );

    const verificationCode = generateRandomCode(6);

    await VerificationCode.create({
      email: normalizedEmail,
      code: verificationCode,
      type: "email",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await emailService.sendVerificationCode(normalizedEmail, verificationCode);

    res.json({
      success: true,
      message: "New verification code sent",
    });
  } catch (error) {
    logger.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification code",
    });
  }
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first",
        requiresVerification: true,
        email: user.email,
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = tokenService.generateToken(user._id.toString());
    const refreshToken = tokenService.generateRefreshToken(user._id.toString());

    res.json({
      success: true,
      token,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

// ================= REFRESH TOKEN =================
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decoded = tokenService.verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const token = tokenService.generateToken(decoded.id);

    res.json({ success: true, token });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// ================= LOGOUT =================
export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
};

// ================= GET ME =================
export const getMe = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, specialty, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { firstName, lastName, phone, specialty, profileImage },
      { new: true, runValidators: true },
    );

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    logger.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = user.generatePasswordResetToken();

    await user.save();

    await emailService.sendPasswordReset(normalizedEmail, resetToken);

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset link",
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const hashedToken = createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
