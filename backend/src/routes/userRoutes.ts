import { Router } from "express";
import {
    createUser,
    getUserById,
    getUsers,
    toggleUserStatus,
    updateUser
} from "../controllers/userController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";

export const userRoutes = Router();

userRoutes.get("/", requireAuth, requireAdmin, getUsers);
userRoutes.get("/:id", requireAuth, requireAdmin, getUserById);
userRoutes.post("/", requireAuth, requireAdmin, createUser);
userRoutes.put("/:id", requireAuth, requireAdmin, updateUser);
userRoutes.patch("/:id/status", requireAuth, requireAdmin, toggleUserStatus);