"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TaskItem } from "@/types/my-tasks";
import { TaskCard } from "./task-card";

/**
 * OCP (Open/Closed Principle):
 * - Open for extension: Can handle any TaskItem type
 * - Closed for modification: Core logic doesn't change
 * 
 * DRY (Don't Repeat Yourself):
 * - Single virtual scrolling implementation
 * - Reusable for all task categories
 */

interface VirtualTaskListProps {
  tasks: TaskItem[];
  emptyMessage?: string;
  estimateSize?: number;
  overscan?: number;
}

export function VirtualTaskList({
  tasks,
  emptyMessage = "Henüz görev yok",
  estimateSize = 80,
  overscan = 5,
}: VirtualTaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Virtual configuration
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (tasks.length === 0) {
    return (
      <div className="p-4 rounded-lg border bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{
        height: `${Math.min(tasks.length * estimateSize, 400)}px`,
        contain: "strict",
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const task = tasks[virtualItem.index];
          if (!task) return null;
          
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="mb-3">
                <TaskCard task={task} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
