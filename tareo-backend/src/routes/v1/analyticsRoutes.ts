import express from "express";
import {
  getUserAnalytics,
  getDoctorAnalytics,
  getSystemAnalytics,
} from "../../controllers/analyticsController";
import { protect, authorize, isPatient, isDoctor } from "../../middleware/auth";
import { UserRole } from "../../models/User";

const router = express.Router();

router.use(protect);

// Patient analytics
router.get("/user", isPatient, getUserAnalytics);

// Doctor analytics
router.get("/doctor", isDoctor, getDoctorAnalytics);
router.get("/system", isDoctor, getSystemAnalytics);

export default router;
