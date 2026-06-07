import { apiClient } from "./apiClient";
import type {LoginResponse} from "../types/auth";

export async function loginRequest(email: string, password: string) {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password
    });

    return response.data;
}

export async function meRequest() {
    const response = await apiClient.get<{ user: LoginResponse["user"] }>("/auth/me");
    return response.data;
}