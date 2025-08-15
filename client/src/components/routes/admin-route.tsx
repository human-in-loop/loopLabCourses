// client/src/components/routes/admin-route.tsx
import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

type AdminRouteProps = {
    component: React.ComponentType<any>;
    [key: string]: any;
};

const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component, ...props }) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [, navigate] = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-loop-dark text-white pt-20 px-4">
                <p className="text-center">Checking authentication...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        navigate("/auth");
        return null;
    }

    if (user && !user.isAdmin) {
        navigate("/");
        return null;
    }

    return <Component {...props} />;
};

export default AdminRoute;
