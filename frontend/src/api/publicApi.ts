import { apiClient } from "./apiClient";
import type{ Category } from "../types/category";
import type { NewsDetails, NewsListItem } from "../types/news";
import type { PaginatedResponse } from "../types/pagination";

export async function getPublicCategories() {
    const response = await apiClient.get<{ items: Category[] }>("/public/categories");
    return response.data;
}

export async function getLatestNews() {
    const response = await apiClient.get<{ items: NewsListItem[] }>(
        "/public/news/latest"
    );

    return response.data;
}

export async function getMostReadNews() {
    const response = await apiClient.get<{ items: NewsListItem[] }>(
        "/public/news/most-read"
    );

    return response.data;
}

export async function getTopReactedNews() {
    const response = await apiClient.get<{ items: NewsListItem[] }>(
        "/public/news/top-reacted"
    );

    return response.data;
}

export async function getPublicNewsById(id: number) {
    const response = await apiClient.get<{ news: NewsDetails }>(
        `/public/news/${id}`
    );

    return response.data;
}

export async function getRelatedNews(id: number) {
    const response = await apiClient.get<{ items: NewsListItem[] }>(
        `/public/news/${id}/related`
    );

    return response.data;
}

export async function getNewsByCategory(
    categoryId: number,
    page: number,
    limit = 10
) {
    const response = await apiClient.get<PaginatedResponse<NewsListItem>>(
        `/public/categories/${categoryId}/news`,
        {
            params: {
                page,
                limit
            }
        }
    );

    return response.data;
}

export async function getNewsByTag(tagName: string, page: number, limit = 10) {
    const response = await apiClient.get<
        PaginatedResponse<NewsListItem> & {
        tag: {
            id: number;
            name: string;
        };
    }
    >(`/public/tags/${encodeURIComponent(tagName)}/news`, {
        params: {
            page,
            limit
        }
    });

    return response.data;
}

export async function searchPublicNews(q: string, page: number, limit = 10) {
    const response = await apiClient.get<PaginatedResponse<NewsListItem>>(
        "/public/news/search",
        {
            params: {
                q,
                page,
                limit
            }
        }
    );

    return response.data;
}

export async function createPublicComment(
    newsId: number,
    data: {
        authorName: string;
        text: string;
    }
) {
    const response = await apiClient.post(
        `/public/news/${newsId}/comments`,
        data
    );

    return response.data;
}

export async function reactToNews(
    newsId: number,
    type: "LIKE" | "DISLIKE"
) {
    const response = await apiClient.post(`/public/news/${newsId}/reaction`, {
        type
    });

    return response.data;
}

export async function reactToComment(
    commentId: number,
    type: "LIKE" | "DISLIKE"
) {
    const response = await apiClient.post(
        `/public/comments/${commentId}/reaction`,
        {
            type
        }
    );

    return response.data;
}