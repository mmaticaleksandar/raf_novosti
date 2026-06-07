import { Router } from "express";
import { login, me } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

export const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.get("/me", requireAuth, me);