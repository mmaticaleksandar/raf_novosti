import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../utils/authStorage";

export function ProtectedRoute() {
    if (!isLoggedIn()) {
        return <Navigate to="/cms/login" replace />;
    }

    return <Outlet />;
}