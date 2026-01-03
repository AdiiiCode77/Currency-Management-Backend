import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter
 * 
 * Provides consistent error responses and prevents sensitive information leakage
 * to the frontend by sanitizing error messages.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'An unexpected error occurred. Please try again later.';
    let error = 'Internal Server Error';

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || exception.name;
      }
    } else if (exception instanceof Error) {
      // Log the actual error for debugging
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );

      // Don't expose internal error details to frontend
      message = 'An unexpected error occurred. Please try again later.';
    } else {
      this.logger.error('Unknown error type', exception);
    }

    // Sanitize database-specific errors
    if (typeof message === 'string') {
      message = this.sanitizeErrorMessage(message);
    } else if (Array.isArray(message)) {
      message = message.map(msg => this.sanitizeErrorMessage(msg));
    }

    // Build response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Log the error (but not sensitive data)
    this.logger.warn(
      `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Sanitizes error messages to prevent exposing sensitive information
   */
  private sanitizeErrorMessage(message: string): string {
    // Don't expose database connection details
    if (message.includes('ECONNREFUSED') || message.includes('connect ETIMEDOUT')) {
      return 'Unable to connect to the database. Please try again later.';
    }

    // Don't expose database constraint names
    if (message.includes('duplicate key') || message.includes('unique constraint')) {
      return 'This record already exists. Please use a different value.';
    }

    // Don't expose foreign key details
    if (message.includes('foreign key constraint')) {
      return 'Cannot complete operation due to related data. Please check references.';
    }

    // Don't expose database query details
    if (message.includes('QueryFailedError') || message.includes('syntax error')) {
      return 'Invalid operation. Please check your input and try again.';
    }

    // Don't expose file system paths
    if (message.includes('ENOENT') || message.includes('no such file')) {
      return 'Required resource not found. Please contact support.';
    }

    // Don't expose JWT/auth implementation details
    if (message.includes('jwt') && message.includes('malformed')) {
      return 'Invalid authentication token. Please log in again.';
    }

    if (message.includes('jwt expired')) {
      return 'Your session has expired. Please log in again.';
    }

    return message;
  }
}
