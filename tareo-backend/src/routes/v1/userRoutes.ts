import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createDoctor,
  toggleUserStatus,
  getDoctors,
} from "../../controllers/userController";
import { protect, authorize } from "../../middleware/auth";
import { UserRole } from "../../models/User";

const router = express.Router();

// All routes require authentication and doctor role (acting as admin)
router.use(protect);
router.use(authorize(UserRole.DOCTOR));

router.get("/", getAllUsers);
router.get("/doctors", getDoctors);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/doctor", createDoctor);
router.patch("/:id/toggle-status", toggleUserStatus);

export default router;
