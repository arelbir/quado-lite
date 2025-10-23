"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TaskItem } from "@/types/my-tasks";

/**
 * SRP (Single Responsibility Principle):
 * - TaskCard only responsible for rendering a single task
 * - No business logic, no data fetching
 * - Pure presentation component
 */

interface TaskCardProps {
  task: TaskItem;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Link
      href={task.link}
      className="block p-4 rounded-lg border hover:bg-accent transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{task.title}</p>
          {task.description && (
            <p className="text-sm text-muted-foreground truncate">
              {task.description}
            </p>
          )}
        </div>
        <TaskBadge task={task} />
      </div>
    </Link>
  );
}

/**
 * Badge rendering logic - separated for clarity
 */
function TaskBadge({ task }: { task: TaskItem }) {
  switch (task.type) {
    case "action":
      return (
        <Badge variant={task.status === "Assigned" ? "default" : "secondary"}>
          {task.status === "Assigned" ? "Atandı" : "Onay Bekliyor"}
        </Badge>
      );
    
    case "dof":
      return (
        <Badge>
          {task.status.replace("Step", "Adım").replace("_", " ")}
        </Badge>
      );
    
    case "approval":
      return (
        <Badge variant="secondary">
          {task.itemType === "action" ? "Aksiyon" : "DÖF"}
        </Badge>
      );
    
    case "finding":
      return <Badge variant="destructive">Açık</Badge>;
    
    default:
      return <Badge>Bilinmiyor</Badge>;
  }
}
