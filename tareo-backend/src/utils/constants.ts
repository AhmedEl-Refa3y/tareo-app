export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
} as const;

export const SESSION_TYPES = {
  CHAT: "chat",
  VIDEO: "video",
} as const;

export const SESSION_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const FEEDBACK_CATEGORIES = {
  GENERAL: "general",
  SESSION: "session",
  FEATURE: "feature",
} as const;

export const KNOWLEDGE_TYPES = {
  GUIDE: "guide",
  ARTICLE: "article",
  FAQ: "faq",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const MESSAGE_LIMITS = {
  MAX_LENGTH: 2000,
  MAX_MESSAGES_PER_SESSION: 10000,
} as const;

export const SESSION_LIMITS = {
  MAX_DURATION_MINUTES: 120,
  MIN_DURATION_MINUTES: 1,
} as const;

export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
} as const;
