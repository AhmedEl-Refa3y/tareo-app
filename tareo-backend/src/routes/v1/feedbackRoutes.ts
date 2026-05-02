import express from "express";
import {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
} from "../../controllers/feedbackController";
import { protect, authorize, isDoctor } from "../../middleware/auth";
import { validate, feedbackValidation } from "../../middleware/validation";
import { UserRole } from "../../models/User";

const router = express.Router();

router.use(protect);

// Patient routes
router.post("/", validate(feedbackValidation), submitFeedback);
router.get("/my-feedback", getMyFeedback);

// Doctor/Admin routes
router.get("/stats", isDoctor, getFeedbackStats);
router.get("/all", isDoctor, getAllFeedback);
router.put("/:id/status", isDoctor, updateFeedbackStatus);

export default router;
