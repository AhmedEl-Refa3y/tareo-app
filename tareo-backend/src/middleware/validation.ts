import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: "param" in err ? err.param : "unknown",
        message: err.msg,
      })),
    });
  };
};

// Validation rules
export const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Please provide a valid phone number"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  body("role")
    .optional()
    .isIn(["patient", "doctor"])
    .withMessage("Role must be either 'patient' or 'doctor'"),
];

export const loginValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const verifyEmailValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail(),
  body("code")
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .matches(/^\d+$/)
    .withMessage("Verification code must contain only numbers"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
];

export const createSessionValidation = [
  body("type")
    .notEmpty()
    .withMessage("Session type is required")
    .isIn(["chat", "video"])
    .withMessage("Session type must be 'chat' or 'video'"),
  body("doctorId").optional().isMongoId().withMessage("Invalid doctor ID"),
];

export const sendMessageValidation = [
  body("sessionId")
    .notEmpty()
    .withMessage("Session ID is required")
    .isMongoId()
    .withMessage("Invalid session ID"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters"),
];

export const feedbackValidation = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
  body("category").optional().isIn(["general", "session", "feature"]),
];

export const createArticleValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("content").trim().notEmpty().withMessage("Content is required"),

  body("type")
    .optional()
    .isIn(["guide", "article", "faq"])
    .withMessage("Invalid type"),

  body("category").optional().trim(),

  body("tags").optional().isArray(),

  body("image").optional().isString(),
];

export const updateProfileValidation = [
  body("firstName").optional().trim().isLength({ min: 2, max: 50 }),
  body("lastName").optional().trim().isLength({ min: 2, max: 50 }),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/),
  body("specialty").optional().trim().isLength({ max: 100 }),
];

export const forgotPasswordValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail(),
];

export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    ),
];
