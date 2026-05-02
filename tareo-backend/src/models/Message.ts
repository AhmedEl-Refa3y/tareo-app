import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  sessionId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderType: "patient" | "doctor";
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true },
);

// Indexes
MessageSchema.index({ sessionId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ isRead: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
