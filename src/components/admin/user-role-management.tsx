/**
 * USER ROLE MANAGEMENT COMPONENT
 * Manage user role assignments
 * 
 * Features:
 * - View assigned roles
 * - Add new roles
 * - Remove roles
 * - Role context (Global/Department/etc)
 * 
 * Pattern: Client Component + Server Actions
 * Created: 2025-01-26
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  assignRoleToUser, 
  removeRoleFromUser 
} from "@/server/actions/user-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, X, Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserRole {
  id: string;
  roleId: string;
  contextType: string;
  isActive: boolean;
  createdAt: Date;
  role: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    category: string;
    isSystem: boolean;
  };
}

interface AvailableRole {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  isSystem: boolean;
}

interface UserRoleManagementProps {
  userId: string;
  userName: string;
  userRoles: UserRole[];
  availableRoles: AvailableRole[];
}

export function UserRoleManagement({
  userId,
  userName,
  userRoles,
  availableRoles,
}: UserRoleManagementProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [removingRoleId, setRemovingRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get roles that are not already assigned
  const unassignedRoles = availableRoles.filter(
    (role) => !userRoles.some((ur) => ur.roleId === role.id)
  );

  const handleAddRole = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    try {
      const result = await assignRoleToUser(userId, selectedRoleId);

      if (result.success) {
        toast.success(result.message || "Role assigned successfully");
        setIsAdding(false);
        setSelectedRoleId("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to assign role");
      }
    } catch (error) {
      toast.error("An error occurred while assigning role");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(true);
    try {
      const result = await removeRoleFromUser(userId, roleId);

      if (result.success) {
        toast.success(result.message || "Role removed successfully");
        setRemovingRoleId(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove role");
      }
    } catch (error) {
      toast.error("An error occurred while removing role");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Assignments
            </CardTitle>
            <CardDescription>
              Manage roles for {userName}
            </CardDescription>
          </div>
          {!isAdding && unassignedRoles.length > 0 && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Role Section */}
        {isAdding && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddRole}
                disabled={loading || !selectedRoleId}
                size="sm"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Assign Role
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setSelectedRoleId("");
                }}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Current Roles List */}
        {userRoles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No roles assigned yet</p>
            {unassignedRoles.length > 0 && (
              <Button
                onClick={() => setIsAdding(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign First Role
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {userRoles.map((userRole) => (
              <div
                key={userRole.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{userRole.role.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {userRole.contextType}
                    </Badge>
                    {userRole.role.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                  {userRole.role.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {userRole.role.description}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => setRemovingRoleId(userRole.roleId)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Remove Role Confirmation Dialog */}
        <AlertDialog
          open={removingRoleId !== null}
          onOpenChange={(open) => !open && setRemovingRoleId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this role from {userName}? This
                action will revoke all permissions associated with this role.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => removingRoleId && handleRemoveRole(removingRoleId)}
                disabled={loading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Remove Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
