import crypto from "crypto";
import { PAGINATION } from "./constants";

export const generateRandomCode = (length: number = 6): string => {
  return crypto
    .randomInt(0, Math.pow(10, length))
    .toString()
    .padStart(length, "0");
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

export const formatDate = (
  date: Date,
  format: string = "YYYY-MM-DD",
): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year.toString())
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

export const truncate = (str: string, length: number = 100): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
};

export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const getPagination = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const take = Math.min(limit, PAGINATION.MAX_LIMIT);
  return { skip, take };
};

export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script.*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;
  const maskedLocal = local[0] + "***" + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone;
  const lastFour = phone.slice(-4);
  const masked = "*".repeat(phone.length - 4) + lastFour;
  return masked;
};
