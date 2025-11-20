import { z } from "zod";
import { APIError } from "./api-response";

/**
 * Validate data against a Zod schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        error.issues
      );
    }
    throw error;
  }
}

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().min(1, "Name is required"),
  leetcodeUsername: z.string().optional(),
});

/**
 * Friend request validation schema
 */
export const friendRequestSchema = z.object({
  userId: z.string().regex(/^[1-9]\d*$/, "userId must be a positive integer string"),
});

/**
 * Message validation schema
 */
export const messageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(5000),
  messageType: z.enum(["text", "image", "file", "code"]).default("text"),
  codeLanguage: z.string().optional(),
});

/**
 * Group creation validation schema
 */
export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(100).default(50),
});

/**
 * Pagination validation schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Validate request body (for use with already parsed JSON)
 */
export function validateRequestBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): T {
  return validateData(schema, body);
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries());
  return validateData(schema, params);
}
