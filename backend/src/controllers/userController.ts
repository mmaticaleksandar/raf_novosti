import { Request, Response, NextFunction } from "express";
import { ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";
import { db } from "../config/db";
import { AppError } from "../utils/AppError";
import { User, UserRole } from "../types/user";

function parsePagination(req: Request) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

function isValidRole(role: unknown): role is UserRole {
    return role === "ADMIN" || role === "CONTENT_CREATOR";
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getUsers(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { page, limit, offset } = parsePagination(req);

        const [rows] = await db.query(
            `
      SELECT id, email, first_name, last_name, role, status, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
            [limit, offset]
        );

        const [countRows] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM users
      `
        );

        const total = (countRows as { total: number }[])[0].total;

        return res.json({
            items: rows,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserById(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = Number(req.params.id);

        if (!userId) {
            throw new AppError("Invalid user id.", 400);
        }

        const [rows] = await db.query(
            `
      SELECT id, email, first_name, last_name, role, status, created_at, updated_at
      FROM users
      WHERE id = ?
      `,
            [userId]
        );

        const users = rows as Omit<User, "password_hash">[];

        if (users.length === 0) {
            throw new AppError("User not found.", 404);
        }

        return res.json({
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
}

export async function createUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const {
            firstName,
            lastName,
            email,
            role,
            password,
            confirmPassword
        } = req.body;

        if (!firstName || !String(firstName).trim()) {
            throw new AppError("First name is required.", 400);
        }

        if (!lastName || !String(lastName).trim()) {
            throw new AppError("Last name is required.", 400);
        }

        if (!email || !String(email).trim()) {
            throw new AppError("Email is required.", 400);
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
            throw new AppError("Invalid email format.", 400);
        }

        if (!isValidRole(role)) {
            throw new AppError("Invalid user role.", 400);
        }

        if (!password || !String(password).trim()) {
            throw new AppError("Password is required.", 400);
        }

        if (String(password).length < 6) {
            throw new AppError("Password must have at least 6 characters.", 400);
        }

        if (password !== confirmPassword) {
            throw new AppError("Passwords do not match.", 400);
        }

        const [existingRows] = await db.query(
            `
      SELECT id
      FROM users
      WHERE email = ?
      `,
            [normalizedEmail]
        );

        if ((existingRows as { id: number }[]).length > 0) {
            throw new AppError("User with this email already exists.", 409);
        }

        const passwordHash = await bcrypt.hash(String(password), 10);

        const status = role === "ADMIN" ? "ACTIVE" : "ACTIVE";

        const [result] = await db.query<ResultSetHeader>(
            `
      INSERT INTO users 
        (email, first_name, last_name, role, status, password_hash)
      VALUES 
        (?, ?, ?, ?, ?, ?)
      `,
            [
                normalizedEmail,
                String(firstName).trim(),
                String(lastName).trim(),
                role,
                status,
                passwordHash
            ]
        );

        return res.status(201).json({
            message: "User created successfully.",
            user: {
                id: result.insertId,
                email: normalizedEmail,
                firstName: String(firstName).trim(),
                lastName: String(lastName).trim(),
                role,
                status
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = Number(req.params.id);

        if (!userId) {
            throw new AppError("Invalid user id.", 400);
        }

        const {
            firstName,
            lastName,
            email,
            role
        } = req.body;

        if (!firstName || !String(firstName).trim()) {
            throw new AppError("First name is required.", 400);
        }

        if (!lastName || !String(lastName).trim()) {
            throw new AppError("Last name is required.", 400);
        }

        if (!email || !String(email).trim()) {
            throw new AppError("Email is required.", 400);
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
            throw new AppError("Invalid email format.", 400);
        }

        if (!isValidRole(role)) {
            throw new AppError("Invalid user role.", 400);
        }

        const [userRows] = await db.query(
            `
      SELECT id
      FROM users
      WHERE id = ?
      `,
            [userId]
        );

        if ((userRows as { id: number }[]).length === 0) {
            throw new AppError("User not found.", 404);
        }

        const [duplicateRows] = await db.query(
            `
      SELECT id
      FROM users
      WHERE email = ? AND id <> ?
      `,
            [normalizedEmail, userId]
        );

        if ((duplicateRows as { id: number }[]).length > 0) {
            throw new AppError("User with this email already exists.", 409);
        }

        const newStatus = role === "ADMIN" ? "ACTIVE" : undefined;

        if (newStatus) {
            await db.query(
                `
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, role = ?, status = ?
        WHERE id = ?
        `,
                [
                    String(firstName).trim(),
                    String(lastName).trim(),
                    normalizedEmail,
                    role,
                    newStatus,
                    userId
                ]
            );
        } else {
            await db.query(
                `
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, role = ?
        WHERE id = ?
        `,
                [
                    String(firstName).trim(),
                    String(lastName).trim(),
                    normalizedEmail,
                    role,
                    userId
                ]
            );
        }

        return res.json({
            message: "User updated successfully."
        });
    } catch (error) {
        next(error);
    }
}

export async function toggleUserStatus(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = Number(req.params.id);

        if (!userId) {
            throw new AppError("Invalid user id.", 400);
        }

        const [rows] = await db.query(
            `
      SELECT id, role, status
      FROM users
      WHERE id = ?
      `,
            [userId]
        );

        const users = rows as Pick<User, "id" | "role" | "status">[];

        if (users.length === 0) {
            throw new AppError("User not found.", 404);
        }

        const user = users[0];

        if (user.role === "ADMIN") {
            throw new AppError("Admin users cannot be deactivated.", 400);
        }

        const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        await db.query(
            `
      UPDATE users
      SET status = ?
      WHERE id = ?
      `,
            [newStatus, userId]
        );

        return res.json({
            message: "User status updated successfully.",
            status: newStatus
        });
    } catch (error) {
        next(error);
    }
}