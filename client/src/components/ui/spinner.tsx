import React from "react";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Spinner({ size = "md" }: SpinnerProps) {
    const sizeClass =
        size === "sm" ? "w-4 h-4" :
            size === "lg" ? "w-10 h-10" :
                "w-6 h-6";

    return (
        <div className="flex justify-center items-center">
            <div
                className={`${sizeClass} border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}

export default Spinner;