import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let errorMessage = "Internal Server Error";
    let errorDetails = err;

    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errorMessage = "You provide incorrect field type or missing required field.";
    }
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                statusCode = 409;
                errorMessage = "Unique constraint failed.";
                break;
            case 'P2003':
                statusCode = 400;
                errorMessage = "Foreign key constraint failed.";
                break;
            case 'P2025':
                statusCode = 404;
                errorMessage = "Record not found.";
                break;
            default:
                statusCode = 400;
                errorMessage = "Database request error.";
        }
    }
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 400;
        errorMessage = "Database request error.";
    }
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        switch (err.errorCode) {
            case 'P1000':
                statusCode = 500;
                errorMessage = "Database connection error.";
                break;
            case 'P1001':
                statusCode = 500;
                errorMessage = "Database connection error.";
                break;
            default:
                statusCode = 500;
                errorMessage = "Database initialization error.";
        }
    }

    res.status(statusCode);
    res.json({
        message: errorMessage,
        error: errorDetails,
    });
}

export default globalErrorHandler;