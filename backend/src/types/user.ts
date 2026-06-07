export type UserRole = "ADMIN" | "CONTENT_CREATOR";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    status: UserStatus;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}