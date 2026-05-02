import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  category: "general" | "session" | "feature";
  status: "pending" | "reviewed";
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      enum: ["general", "session", "feature"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Indexes
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ sessionId: 1 });
FeedbackSchema.index({ status: 1 });

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);
