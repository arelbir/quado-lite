"use client";

import { useState } from "react";
import { toast } from "sonner";
import { assignRoleToUser } from "@/server/actions/user-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface BulkRoleAssignmentProps {
  selectedUsers: Array<{ id: string; name: string; email: string }>;
  availableRoles: Array<{ id: string; name: string; code: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function BulkRoleAssignment({
  selectedUsers,
  availableRoles,
  open,
  onOpenChange,
  onComplete,
}: BulkRoleAssignmentProps) {
  const router = useRouter();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    details: Array<{ userId: string; userName: string; success: boolean; message: string }>;
  } | null>(null);

  const handleBulkAssign = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    const assignmentResults = [];

    try {
      // Assign role to each user sequentially (to avoid race conditions)
      for (const user of selectedUsers) {
        try {
          const result = await assignRoleToUser(user.id, selectedRoleId);
          
          // Extract real user name from backend response (works for both success and error)
          const realUserName = ('data' in result && result.data) ? result.data.userName : user.name;
          
          assignmentResults.push({
            userId: user.id,
            userName: realUserName,
            success: result.success,
            message: result.message || (result.success ? "Success" : "Failed"),
          });
        } catch (error) {
          assignmentResults.push({
            userId: user.id,
            userName: user.name,
            success: false,
            message: "Error occurred",
          });
        }
      }

      const successCount = assignmentResults.filter((r) => r.success).length;
      const failedCount = assignmentResults.filter((r) => !r.success).length;

      setResults({
        success: successCount,
        failed: failedCount,
        details: assignmentResults,
      });

      if (successCount > 0) {
        toast.success(`Role assigned to ${successCount} user(s)`);
        router.refresh();
        onComplete?.();
      }

      if (failedCount > 0) {
        toast.error(`Failed to assign role to ${failedCount} user(s)`);
      }
    } catch (error) {
      toast.error("An error occurred during bulk assignment");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRoleId("");
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Role Assignment
          </DialogTitle>
          <DialogDescription>
            Assign a role to {selectedUsers.length} selected user(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Users */}
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Users:</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {selectedUsers.map((user) => (
                <Badge key={user.id} variant="secondary">
                  {user.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Role:</label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={loading || !!results}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-2 border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Assignment Results:</span>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-green-600">
                    ✓ {results.success} Success
                  </Badge>
                  {results.failed > 0 && (
                    <Badge variant="destructive">
                      ✗ {results.failed} Failed
                    </Badge>
                  )}
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {results.details.map((detail, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded ${
                      detail.success
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span className="font-medium">{detail.userName}:</span>{" "}
                    {detail.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {results ? "Close" : "Cancel"}
          </Button>
          {!results && (
            <Button
              onClick={handleBulkAssign}
              disabled={loading || !selectedRoleId}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign to {selectedUsers.length} User(s)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
