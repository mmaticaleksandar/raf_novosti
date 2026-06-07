import { Router } from "express";
import {
    createNews,
    deleteNews,
    getNewsById,
    getNewsList,
    searchNews,
    updateNews
} from "../controllers/newsController";
import { requireAuth } from "../middleware/authMiddleware";

export const newsRoutes = Router();

newsRoutes.get("/", requireAuth, getNewsList);
newsRoutes.get("/search", requireAuth, searchNews);
newsRoutes.get("/:id", requireAuth, getNewsById);
newsRoutes.post("/", requireAuth, createNews);
newsRoutes.put("/:id", requireAuth, updateNews);
newsRoutes.delete("/:id", requireAuth, deleteNews);