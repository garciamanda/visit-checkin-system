import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  console.error('Error Handler:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  if (error.name.includes('Prisma')) {
    return res.status(400).json({
      error: 'Erro no banco de dados',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      message: error.message,
      stack: error.stack 
    })
  });
};