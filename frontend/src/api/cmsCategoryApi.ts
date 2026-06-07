import { apiClient } from "./apiClient";
import type {Category} from "../types/category";
import type {PaginatedResponse} from "../types/pagination";

export async function getCmsCategories(page: number, limit = 10) {
    const response = await apiClient.get<PaginatedResponse<Category>>(
        "/cms/categories",
        {
            params: {
                page,
                limit
            }
        }
    );

    return response.data;
}

export async function getCmsCategoryById(id: number) {
    const response = await apiClient.get<{ category: Category }>(
        `/cms/categories/${id}`
    );

    return response.data;
}

export async function createCmsCategory(data: {
    name: string;
    description: string;
}) {
    const response = await apiClient.post("/cms/categories", data);
    return response.data;
}

export async function updateCmsCategory(
    id: number,
    data: {
        name: string;
        description: string;
    }
) {
    const response = await apiClient.put(`/cms/categories/${id}`, data);
    return response.data;
}

export async function deleteCmsCategory(id: number) {
    const response = await apiClient.delete(`/cms/categories/${id}`);
    return response.data;
}