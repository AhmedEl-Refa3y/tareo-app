import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  profileImage?: string;
  role: UserRole;
  doctorId?: string;
  specialty?: string;
  licenseNumber?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  lastLogin?: Date;
  lastPasswordChange?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  twoFactorSecret?: string;
  notificationTokens: string[];
  pushEnabled: boolean;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  toJSON(): Partial<IUser>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    profileImage: { type: String, default: null },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PATIENT,
    },
    doctorId: { type: String, unique: true, sparse: true },
    specialty: { type: String, trim: true },
    licenseNumber: { type: String, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isTwoFactorEnabled: { type: Boolean, default: false },
    lastLogin: Date,
    lastPasswordChange: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    twoFactorSecret: String,
    notificationTokens: [String],
    pushEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ doctorId: 1 });
UserSchema.index({ role: 1 });

// Virtuals
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hooks
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(
    parseInt(process.env.BCRYPT_ROUNDS || "12"),
  );
  this.password = await bcrypt.hash(this.password, salt);
  this.lastPasswordChange = new Date();
  next();
});

UserSchema.pre("save", async function (next) {
  if (this.role === UserRole.DOCTOR && !this.doctorId) {
    const count = await mongoose
      .model<IUser>("User")
      .countDocuments({ role: UserRole.DOCTOR });
    this.doctorId = `DOC${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// Methods
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

UserSchema.methods.generateEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return verificationToken;
};

UserSchema.methods.toJSON = function (): Partial<IUser> {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.twoFactorSecret;
  delete obj.__v;
  return obj;
};

export default mongoose.model<IUser>("User", UserSchema);
