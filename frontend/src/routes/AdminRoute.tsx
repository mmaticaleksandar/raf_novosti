import { Navigate, Outlet } from "react-router-dom";
import { isAdmin } from "../utils/authStorage";

export function AdminRoute() {
    if (!isAdmin()) {
        return <Navigate to="/cms/categories" replace />;
    }

    return <Outlet />;
}