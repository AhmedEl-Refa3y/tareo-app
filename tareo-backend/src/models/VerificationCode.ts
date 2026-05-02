import mongoose, { Document, Schema } from "mongoose";

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  type: "email" | "password" | "twofactor";
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["email", "password", "twofactor"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Auto-expire TTL index
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
VerificationCodeSchema.index({ email: 1, type: 1 });

export default mongoose.model<IVerificationCode>(
  "VerificationCode",
  VerificationCodeSchema,
);
