import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  type: "chat" | "video";
  status: "pending" | "active" | "completed" | "cancelled";
  duration: number;
  startedAt: Date;
  endedAt?: Date;
  rating?: number;
  feedback?: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["chat", "video"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    duration: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
  },
  { timestamps: true },
);

// Indexes
SessionSchema.index({ patientId: 1, createdAt: -1 });
SessionSchema.index({ doctorId: 1 });
SessionSchema.index({ status: 1 });
SessionSchema.index({ type: 1 });

export default mongoose.model<ISession>("Session", SessionSchema);
