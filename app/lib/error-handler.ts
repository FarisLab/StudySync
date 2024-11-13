import { NextResponse } from 'next/server';

export interface ErrorResponse {
  error: string;
  status: number;
}

// Define custom error types
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export function handleError(error: unknown): ErrorResponse {
  console.error('Error:', error);

  // Type guard to check if error is one of our custom errors
  if (error instanceof DatabaseError) {
    return {
      error: error.message,
      status: 500
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: error.message,
      status: 400
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      error: error.message,
      status: 401
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      status: 500
    };
  }

  // Default case for unknown errors
  return {
    error: 'An unexpected error occurred',
    status: 500
  };
}

export function createErrorResponse(error: unknown): NextResponse<ErrorResponse> {
  const errorResponse = handleError(error);
  return NextResponse.json(errorResponse, { status: errorResponse.status });
} 