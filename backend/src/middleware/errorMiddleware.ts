import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function errorMiddleware(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
}