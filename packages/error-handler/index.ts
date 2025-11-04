export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

//Not Found Error
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: any) {
    super(message, 404, true, details);
  }
}

//Validation Error (react-hook-form, joi, etc.)
class ValidationError extends AppError {
  constructor(message = "Validation Error", details?: any) {
    super(message, 400, true, details);
  }
}

//Authentication Error
export class AuthenticationError extends AppError {
  constructor(message = "Authentication Failed", details?: any) {
    super(message, 401, true, details);
  }
}

//Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message = "Access Denied", details?: any) {
    super(message, 403, true, details);
  }
}

//Database Error
export class DatabaseError extends AppError {
  constructor(message = "Database Error", details?: any) {
    super(message, 500, false, details);
  }
}

//Rate Limiting Error
export class RateLimitError extends AppError {
  constructor(
    message = "Too Many Requests, Please try again later",
    details?: any
  ) {
    super(message, 429, true, details);
  }
}
