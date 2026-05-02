import express from "express";
import {
  createSession,
  getMySessions,
  getDoctorSessions,
  getSessionById,
  endSession,
  getSessionStats,
  getDoctorStats,
} from "../../controllers/sessionController";
import { protect, authorize, isPatient, isDoctor } from "../../middleware/auth";
import { validate, createSessionValidation } from "../../middleware/validation";
import { sessionLimiter } from "../../middleware/rateLimiter";
import { UserRole } from "../../models/User";

const router = express.Router();

router.use(protect);

// Patient routes
router.post(
  "/",
  isPatient,
  sessionLimiter,
  validate(createSessionValidation),
  createSession,
);
router.get("/my-sessions", isPatient, getMySessions);
router.get("/stats", isPatient, getSessionStats);

// Doctor routes
router.get("/doctor-sessions", isDoctor, getDoctorSessions);
router.get("/doctor/stats", isDoctor, getDoctorStats);

// Common routes
router.get("/:id", getSessionById);
router.put("/:id/end", endSession);

export default router;
