import { apiClient } from "./apiClient";
import type {PaginatedResponse} from "../types/pagination";
import type {NewsDetails, NewsListItem} from "../types/news";

export async function getCmsNews(
    page: number,
    limit: number,
    categoryId?: number
) {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (categoryId) {
        params.append("categoryId", String(categoryId));
    }

    const response = await apiClient.get(`/cms/news?${params.toString()}`);
    return response.data;
}

export async function searchCmsNews(q: string, page: number, limit = 10) {
    const response = await apiClient.get<PaginatedResponse<NewsListItem>>(
        "/cms/news/search",
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

export async function getCmsNewsById(id: number) {
    const response = await apiClient.get<{ news: NewsDetails }>(
        `/cms/news/${id}`
    );

    return response.data;
}

export async function createCmsNews(data: {
    title: string;
    text: string;
    categoryId: number;
    tags: string;
}) {
    const response = await apiClient.post("/cms/news", data);
    return response.data;
}

export async function updateCmsNews(
    id: number,
    data: {
        title: string;
        text: string;
        categoryId: number;
        tags: string;
    }
) {
    const response = await apiClient.put(`/cms/news/${id}`, data);
    return response.data;
}

export async function deleteCmsNews(id: number) {
    const response = await apiClient.delete(`/cms/news/${id}`);
    return response.data;
}