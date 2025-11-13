/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generate unique request ID for tracking
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage: string | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Ensure message is always a string
    let message: string;
    if (typeof rawMessage === 'string') {
      message = rawMessage;
    } else if (typeof rawMessage === 'object' && rawMessage !== null) {
      const messageObj = rawMessage as { message?: string };
      message = messageObj.message || 'An error occurred';
    } else {
      message = 'An error occurred';
    }

    // Log error with context (development only for security)
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${status} ${message}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${status} ${message}`,
      );
    }

    // Prepare response based on environment
    const errorResponse = {
      statusCode: status,
      timestamp,
      path: request.url,
      requestId,
      message: this.getUserFriendlyMessage(status, message),
    };

    // Add stack trace only in development
    if (isDevelopment && exception instanceof Error) {
      errorResponse['stack'] = exception.stack;
    }

    response.status(status).json(errorResponse);
  }

  private getUserFriendlyMessage(
    status: number,
    originalMessage: string,
  ): string {
    // Return user-friendly messages instead of technical errors
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Invalid request data. Please check your input.';
      case HttpStatus.UNAUTHORIZED:
        return 'Authentication required. Please log in.';
      case HttpStatus.FORBIDDEN:
        return 'Access denied. You do not have permission for this action.';
      case HttpStatus.NOT_FOUND:
        return 'The requested resource was not found.';
      case HttpStatus.CONFLICT:
        return 'This action conflicts with existing data.';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'The provided data is not valid.';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later.';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'An internal server error occurred. Please try again later.';
      case HttpStatus.BAD_GATEWAY:
        return 'Service temporarily unavailable. Please try again later.';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }
}
