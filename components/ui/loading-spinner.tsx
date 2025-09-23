"use client";

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className={cn("flex items-center justify-center gap-2", className)}>
            <div
                className={cn(
                    "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
                    sizeClasses[size]
                )}
            />
            {text && (
                <span className="text-sm text-gray-600">{text}</span>
            )}
        </div>
    );
}

export function LoadingCard({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse", className)}>
            <div className="bg-gray-200 rounded-lg p-6 space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
}

export function LoadingTable({ rows = 5, className }: { rows?: number; className?: string }) {
    return (
        <div className={cn("animate-pulse space-y-2", className)}>
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex space-x-4 p-4 bg-gray-50 rounded">
                    <div className="h-4 bg-gray-300 rounded flex-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
            ))}
        </div>
    );
}