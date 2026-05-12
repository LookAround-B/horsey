import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that normalizes all error responses.
 * In production: NEVER exposes error.stack or internal error messages.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction = process.env.NODE_ENV === 'production';

    const requestId = (request.headers['x-request-id'] as string) || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'An internal error occurred';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      error = HttpStatus[status] || 'Error';

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        // For validation errors (400), return field-level messages
        if (Array.isArray(resp.message)) {
          message = resp.message as string[];
        } else if (typeof resp.message === 'string') {
          message = resp.message;
        } else {
          message = exception.message;
        }
      }
    } else if (exception instanceof Error) {
      // Log full error internally
      this.logger.error(
        `[${requestId}] Unhandled exception: ${exception.message}`,
        exception.stack,
      );

      if (isProduction) {
        message = 'An internal error occurred';
      } else {
        message = exception.message;
      }
    }

    // Log all 5xx errors with requestId
    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${status} ${error}: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      error: typeof error === 'string' ? error : 'Error',
      message,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
