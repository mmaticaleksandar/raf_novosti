import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import { AppError } from "../utils/AppError";
import { User } from "../types/user";

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError("Email and password are required.", 400);
        }

        const [rows] = await db.query(
            `
                SELECT id, email, first_name, last_name, role, status, password_hash
                FROM users
                WHERE email = ?
            `,
            [email]
        );

        const users = rows as User[];

        if (users.length === 0) {
            throw new AppError("Invalid email or password.", 401);
        }

        const user = users[0];

        if (user.status !== "ACTIVE") {
            throw new AppError("User account is inactive.", 403);
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            throw new AppError("Invalid email or password.", 401);
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new AppError("JWT secret is not configured.", 500);
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            jwtSecret
        );

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function me(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            throw new AppError("User is not authenticated.", 401);
        }

        const [rows] = await db.query(
            `
      SELECT id, email, first_name, last_name, role, status
      FROM users
      WHERE id = ?
      `,
            [req.user.id]
        );

        const users = rows as Omit<User, "password_hash" | "created_at" | "updated_at">[];

        if (users.length === 0) {
            throw new AppError("User not found.", 404);
        }

        const user = users[0];

        if (user.status !== "ACTIVE") {
            throw new AppError("User account is inactive.", 403);
        }

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
}