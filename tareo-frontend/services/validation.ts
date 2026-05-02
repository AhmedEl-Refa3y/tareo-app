// services/validation.ts

export interface ValidationErrors {
  [key: string]: string | undefined;
}

/* ---------------- EMAIL ---------------- */
export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return "Please enter a valid email address";

  return null;
};

/* ---------------- PASSWORD ---------------- */
export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";

  if (password.length < 8) return "Password must be at least 8 characters";

  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";

  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";

  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";

  if (!/[@$!%*?&]/.test(password))
    return "Password must contain at least one special character (@$!%*?&)";

  return null;
};

/* ---------------- NAME ---------------- */
export const validateName = (name: string, field: string): string | null => {
  if (!name) return `${field} is required`;

  if (name.length < 2) return `${field} must be at least 2 characters`;

  if (name.length > 50) return `${field} cannot exceed 50 characters`;

  return null;
};

/* ---------------- PHONE ---------------- */
export const validatePhone = (phone: string): string | null => {
  if (!phone) return "Phone number is required";

  const phoneRegex = /^\+?[0-9]{10,15}$/;

  if (!phoneRegex.test(phone)) return "Please enter a valid phone number";

  return null;
};

/* ---------------- CONFIRM PASSWORD ---------------- */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string | null => {
  if (!confirmPassword) return "Please confirm your password";

  if (password !== confirmPassword) return "Passwords do not match";

  return null;
};

/* ---------------- VERIFICATION CODE ---------------- */
export const validateVerificationCode = (code: string): string | null => {
  if (!code) return "Verification code is required";

  if (!/^\d{6}$/.test(code)) return "Code must be exactly 6 digits";

  return null;
};

/* ---------------- RESET TOKEN ---------------- */
export const validateResetToken = (token: string): string | null => {
  if (!token) return "Reset token is required";

  return null;
};

/* ---------------- FEEDBACK RATING ---------------- */
export const validateFeedbackRating = (rating: number): string | null => {
  if (!rating) return "Please select a rating";

  if (rating < 1 || rating > 5) return "Rating must be between 1 and 5";

  return null;
};

/* ---------------- FEEDBACK COMMENT ---------------- */
export const validateFeedbackComment = (comment: string): string | null => {
  if (!comment) return null;

  if (comment.length > 1000) return "Comment cannot exceed 1000 characters";

  return null;
};
