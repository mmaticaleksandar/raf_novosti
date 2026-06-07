export type UserRole = "ADMIN" | "CONTENT_CREATOR";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface CmsUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}