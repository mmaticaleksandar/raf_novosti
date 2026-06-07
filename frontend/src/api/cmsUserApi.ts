import { apiClient } from "./apiClient";
import type {PaginatedResponse} from "../types/pagination";
import type {CmsUser, UserRole} from "../types/user";

export async function getCmsUsers(page: number, limit = 10) {
    const response = await apiClient.get<PaginatedResponse<CmsUser>>(
        "/cms/users",
        {
            params: {
                page,
                limit
            }
        }
    );

    return response.data;
}

export async function getCmsUserById(id: number) {
    const response = await apiClient.get<{ user: CmsUser }>(`/cms/users/${id}`);
    return response.data;
}

export async function createCmsUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    password: string;
    confirmPassword: string;
}) {
    const response = await apiClient.post("/cms/users", data);
    return response.data;
}

export async function updateCmsUser(
    id: number,
    data: {
        firstName: string;
        lastName: string;
        email: string;
        role: UserRole;
    }
) {
    const response = await apiClient.put(`/cms/users/${id}`, data);
    return response.data;
}

export async function toggleCmsUserStatus(id: number) {
    const response = await apiClient.patch(`/cms/users/${id}/status`);
    return response.data;
}