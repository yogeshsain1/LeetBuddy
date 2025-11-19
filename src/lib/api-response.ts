import { NextResponse } from "next/server";

/**
 * Standardized API response structure
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    totalPages?: number;
    total?: number;
    timestamp: string;
  };
}

/**
 * Custom API error class
 */
export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  meta?: APIResponse<T>["meta"]
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Error response helper
 */
export function errorResponse(
  error: APIError | Error,
  statusCode: number = 500
): NextResponse<APIResponse> {
  const isAPIError = error instanceof APIError;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: isAPIError ? error.code : "INTERNAL_SERVER_ERROR",
        message: error.message,
        details: isAPIError ? error.details : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: isAPIError ? error.statusCode : statusCode }
  );
}

/**
 * Validation error response
 */
export function validationError(
  message: string,
  details?: any
): NextResponse<APIResponse> {
  return errorResponse(new APIError("VALIDATION_ERROR", message, 400, details));
}

/**
 * Unauthorized error response
 */
export function unauthorizedError(
  message: string = "Unauthorized"
): NextResponse<APIResponse> {
  return errorResponse(new APIError("UNAUTHORIZED", message, 401));
}

/**
 * Not found error response
 */
export function notFoundError(
  message: string = "Resource not found"
): NextResponse<APIResponse> {
  return errorResponse(new APIError("NOT_FOUND", message, 404));
}

/**
 * Forbidden error response
 */
export function forbiddenError(
  message: string = "Forbidden"
): NextResponse<APIResponse> {
  return errorResponse(new APIError("FORBIDDEN", message, 403));
}

/**
 * Handle async API route with error catching
 */
export function withErrorHandling<T>(
  handler: (request: Request) => Promise<NextResponse<APIResponse<T>>>
) {
  return async (request: Request): Promise<NextResponse<APIResponse<T>>> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error("API Error:", error);
      return errorResponse(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
    }
  };
}
