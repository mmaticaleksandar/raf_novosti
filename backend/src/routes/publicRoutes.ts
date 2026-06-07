import { Router } from "express";

import {
    getPublicCategories,
    getNewsByCategory
} from "../controllers/publicController/publicCategoryController";

import {
    getLatestNews,
    getMostReadNews,
    getPublicNewsById,
    searchPublicNews,
    getRelatedNews,
    getTopReactedNews
} from "../controllers/publicController/publicNewsController";

import {
    createComment
} from "../controllers/publicController/publicCommentController";

import {
    reactToNews,
    reactToComment
} from "../controllers/publicController/publicReactionController";

import {
    getNewsByTag
} from "../controllers/publicController/publicTagController";

export const publicRoutes = Router();

publicRoutes.get("/categories", getPublicCategories);

publicRoutes.get("/news/latest", getLatestNews);
publicRoutes.get("/news/most-read", getMostReadNews);
publicRoutes.get("/news/search", searchPublicNews);
publicRoutes.get("/news/:id/related", getRelatedNews);
publicRoutes.get("/news/top-reacted", getTopReactedNews);
publicRoutes.get("/news/:id", getPublicNewsById);
publicRoutes.post("/news/:id/comments", createComment);
publicRoutes.post("/news/:id/reaction", reactToNews);

publicRoutes.post("/comments/:id/reaction", reactToComment);

publicRoutes.get("/tags/:tagName/news", getNewsByTag);

publicRoutes.get("/categories/:id/news", getNewsByCategory);