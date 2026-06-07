import { Router } from "express";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
    updateCategory
} from "../controllers/categoryController";
import { requireAuth } from "../middleware/authMiddleware";

export const categoryRoutes = Router();

categoryRoutes.get("/", requireAuth, getCategories);
categoryRoutes.get("/:id", requireAuth, getCategoryById);
categoryRoutes.post("/", requireAuth, createCategory);
categoryRoutes.put("/:id", requireAuth, updateCategory);
categoryRoutes.delete("/:id", requireAuth, deleteCategory);