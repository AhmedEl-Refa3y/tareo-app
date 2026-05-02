import express from "express";
import {
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../../controllers/knowledgeController";

import { protect, isDoctor } from "../../middleware/auth";
import { validate, createArticleValidation } from "../../middleware/validation";

const router = express.Router();

// Public routes
router.get("/", getAllArticles);
router.get("/category/:category", getArticlesByCategory);
router.get("/:id", getArticleById);

// Protected routes (Doctor only)
router.use(protect);
router.use(isDoctor);

router.post("/", validate(createArticleValidation), createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

export default router;
