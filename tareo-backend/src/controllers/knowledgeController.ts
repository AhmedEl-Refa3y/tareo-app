import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import KnowledgeBase from "../models/KnowledgeBase";
import { logger } from "../utils/logger";

export const getAllArticles = async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, search, page = 1, limit = 20 } = req.query;

    const filter: any = { isPublished: true };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [search] } },
      ];
    }

    const articles = await KnowledgeBase.find(filter)
      .populate("authorId", "firstName lastName role")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await KnowledgeBase.countDocuments(filter);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Get articles error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch articles" });
  }
};

export const getArticleById = async (req: AuthRequest, res: Response) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id).populate(
      "authorId",
      "firstName lastName role",
    );

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    article.views += 1;
    await article.save();

    res.json({ success: true, data: article });
  } catch (error) {
    logger.error("Get article by ID error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch article" });
  }
};

export const getArticlesByCategory = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const articles = await KnowledgeBase.find({
      category: req.params.category,
      isPublished: true,
    }).populate("authorId", "firstName lastName");

    res.json({ success: true, data: articles });
  } catch (error) {
    logger.error("Get articles by category error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch articles" });
  }
};

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, type, category, tags, image } = req.body;

    const article = await KnowledgeBase.create({
      title,
      content,
      type: type || "article",
      category: category || "general",
      image: image || null,
      tags: tags || [],
      authorId: req.user?._id,
      isPublished: true,
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    logger.error("Create article error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create article" });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await KnowledgeBase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    logger.error("Update article error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update article" });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await KnowledgeBase.findByIdAndDelete(req.params.id);

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    res.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    logger.error("Delete article error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete article" });
  }
};
