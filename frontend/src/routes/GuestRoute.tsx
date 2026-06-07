import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../utils/authStorage";

export function GuestRoute() {
    if (isLoggedIn()) {
        return <Navigate to="/cms/categories" replace />;
    }

    return <Outlet />;
}