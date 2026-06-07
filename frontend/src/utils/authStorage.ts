import type {AuthUser} from "../types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveAuth(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser) as AuthUser;
    } catch {
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
    return Boolean(getToken());
}

export function isAdmin() {
    return getCurrentUser()?.role === "ADMIN";
}