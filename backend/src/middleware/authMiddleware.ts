import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import { AppError } from "../utils/AppError";
import { UserRole, UserStatus } from "../types/user";

interface JwtPayload {
    userId: number;
    email: string;
    role: UserRole;
}

interface AuthUserRow {
    id: number;
    email: string;
    role: UserRole;
    status: UserStatus;
}

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError("Authorization header is missing.", 401);
        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            throw new AppError("Invalid authorization format.", 401);
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new AppError("JWT secret is not configured.", 500);
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const [rows] = await db.query(
            `
                SELECT id, email, role, status
                FROM users
                WHERE id = ?
            `,
            [decoded.userId]
        );

        const users = rows as AuthUserRow[];

        if (users.length === 0) {
            throw new AppError("User no longer exists.", 401);
        }

        const user = users[0];

        if (user.status !== "ACTIVE") {
            throw new AppError("User account is inactive.", 403);
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }

        next(new AppError("Invalid or expired token.", 401));
    }
}

export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.user) {
        return next(new AppError("User is not authenticated.", 401));
    }

    if (req.user.role !== "ADMIN") {
        return next(new AppError("Admin access required.", 403));
    }

    next();
}