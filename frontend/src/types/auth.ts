export type UserRole = "ADMIN" | "CONTENT_CREATOR";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AuthUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}