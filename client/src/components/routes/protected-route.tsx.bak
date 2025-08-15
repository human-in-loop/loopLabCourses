import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import type { User } from "@shared/schema";

interface ProtectedRouteProps {
    component: React.ComponentType<any>;
    [key: string]: any;
}

export default function ProtectedRoute({ component: Component, ...props }: ProtectedRouteProps) {
    const [, setLocation] = useLocation();

    const { data, isLoading } = useQuery<{ user: User | null }>({
        queryKey: ["/api/auth/me"],
        queryFn: async () => {
            const response = await fetch("/api/auth/me", {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch user");
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const user = data?.user;

    useEffect(() => {
        if (!isLoading && !user) {
            setLocation("/auth");
        }
    }, [user, isLoading, setLocation]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-loop-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loop-purple"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return <Component {...props} user={user} />;
}