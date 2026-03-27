import React from "react";

// Single shimmer block
export function Skeleton({ width = "100%", height = 16, borderRadius = 6, style = {} }) {
    return (
        <div
            className="skeleton-shimmer"
            style={{ width, height, borderRadius, ...style }}
        />
    );
}

// Preset: stat card skeleton
export function StatCardSkeleton() {
    return (
        <div className="stat-card" style={{ minHeight: 90 }}>
            <Skeleton width="50%" height={12} style={{ marginBottom: 10 }} />
            <Skeleton width="35%" height={32} />
        </div>
    );
}

// Preset: project card skeleton
export function ProjectCardSkeleton() {
    return (
        <div className="project-card" style={{ pointerEvents: "none" }}>
            <Skeleton width="70%" height={18} style={{ marginBottom: 12 }} />
            <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
            <Skeleton width="55%" height={12} />
        </div>
    );
}

// Preset: task card skeleton
export function TaskCardSkeleton() {
    return (
        <div className="task-card" style={{ pointerEvents: "none" }}>
            <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="45%" height={10} />
        </div>
    );
}

// Preset: widget row skeleton
export function WidgetRowSkeleton() {
    return (
        <div style={{ padding: "8px 18px", display: "flex", gap: 12, alignItems: "center" }}>
            <Skeleton width="60%" height={13} />
            <Skeleton width="20%" height={20} borderRadius={10} />
        </div>
    );
}
