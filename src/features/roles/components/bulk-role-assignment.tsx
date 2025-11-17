"use client";

import { useState } from "react";
import { toast } from "sonner";
import { assignRoleToUser } from "@/features/users/actions/user-actions";
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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
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
      toast.error(t('bulkAssignment.selectRoleError'));
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
            message: result.message || (result.success ? tCommon('messages.success') : tCommon('messages.failed')),
          });
        } catch (error) {
          assignmentResults.push({
            userId: user.id,
            userName: user.name,
            success: false,
            message: tCommon('messages.error'),
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
        toast.success(t('bulkAssignment.successCount', { count: successCount }));
        router.refresh();
        onComplete?.();
      }

      if (failedCount > 0) {
        toast.error(t('bulkAssignment.failedCount', { count: failedCount }));
      }
    } catch (error) {
      toast.error(t('bulkAssignment.assignmentError'));
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
            {t('bulkAssignment.title')}
          </DialogTitle>
          <DialogDescription>
            {t('bulkAssignment.description', { count: selectedUsers.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Users */}
          <div>
            <label className="text-sm font-medium mb-2 block">{t('bulkAssignment.selectedUsers')}:</label>
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
            <label className="text-sm font-medium mb-2 block">{t('bulkAssignment.selectRole')}:</label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={loading || !!results}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('bulkAssignment.rolePlaceholder')} />
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
            {results ? tCommon('actions.close') : tCommon('actions.cancel')}
          </Button>
          {!results && (
            <Button
              onClick={handleBulkAssign}
              disabled={loading || !selectedRoleId}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('bulkAssignment.assignButton', { count: selectedUsers.length })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
