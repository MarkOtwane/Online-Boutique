import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
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

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
