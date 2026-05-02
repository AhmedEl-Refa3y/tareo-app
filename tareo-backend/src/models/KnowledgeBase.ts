import mongoose, { Document, Schema } from "mongoose";

export interface IKnowledgeBase extends Document {
  title: string;
  content: string;
  type: "guide" | "article" | "faq";
  category: string;
  image?: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseSchema = new Schema<IKnowledgeBase>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    content: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["guide", "article", "faq"],
      required: true,
      default: "article",
    },

    category: {
      type: String,
      required: true,
      trim: true,
      default: "general",
    },

    image: {
      type: String,
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

/* =========================================================
   🔥 INDEXES (FIXED)
========================================================= */

// Text search ONLY on strings (NO arrays here ❌)
KnowledgeBaseSchema.index({ title: "text", content: "text" });

// Regular indexes for filtering
KnowledgeBaseSchema.index({ tags: 1 });
KnowledgeBaseSchema.index({ category: 1 });
KnowledgeBaseSchema.index({ type: 1 });

export default mongoose.model<IKnowledgeBase>(
  "KnowledgeBase",
  KnowledgeBaseSchema,
);
