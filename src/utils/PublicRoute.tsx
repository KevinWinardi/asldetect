import { Navigate, Outlet } from "react-router-dom";

export function PublicRoute() {
    const token = localStorage.getItem('token');
    return token ? <Navigate to={'/'} /> : <Outlet />;
}