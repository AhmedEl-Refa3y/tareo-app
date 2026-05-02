import express from "express";
import {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../../controllers/authController";
import { protect } from "../../middleware/auth";
import { validate } from "../../middleware/validation";
import {
  authLimiter,
  emailLimiter,
  registerLimiter,
} from "../../middleware/rateLimiter";
import {
  registerValidation,
  verifyEmailValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../../middleware/validation";

const router = express.Router();

// Public routes
router.post(
  "/register",
  registerLimiter,
  validate(registerValidation),
  register,
);
router.post("/verify-email", validate(verifyEmailValidation), verifyEmail);
router.post("/resend-verification", emailLimiter, resendVerificationCode);
router.post("/login", authLimiter, validate(loginValidation), login);
router.post("/refresh-token", refreshToken);
router.post(
  "/forgot-password",
  emailLimiter,
  validate(forgotPasswordValidation),
  forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword,
);

// Protected routes
router.use(protect);
router.post("/logout", logout);
router.get("/me", getMe);
router.put("/profile", validate(updateProfileValidation), updateProfile);
router.put(
  "/change-password",
  validate(changePasswordValidation),
  changePassword,
);

export default router;
