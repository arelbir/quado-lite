'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { RoleSelector } from '../FormFields/RoleSelector';
import { ConditionEditor } from '../FormFields/ConditionEditor';
import { useTranslations } from 'next-intl';

// Debounce delay for text inputs (ms)
const DEBOUNCE_DELAY = 300;

export function PropertiesPanel() {
  const t = useTranslations('workflow');
  const { selectedNode, updateNodeData, deleteNode } = useWorkflowStore();
  
  // Local state to prevent input reset on every keystroke
  const [localData, setLocalData] = useState<Record<string, any>>({});
  
  // Track current node ID to detect changes
  const currentNodeIdRef = useRef<string | null>(null);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Sync local state when selected node changes
  useEffect(() => {
    if (selectedNode && selectedNode.id !== currentNodeIdRef.current) {
      // Node changed - update local state immediately
      currentNodeIdRef.current = selectedNode.id;
      setLocalData(selectedNode.data || {});
      
      // Clear any pending debounced updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    }
  }, [selectedNode?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced update for text inputs (optimization)
  const debouncedUpdate = useCallback((nodeId: string, field: string, value: any) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      updateNodeData(nodeId, { [field]: value });
    }, DEBOUNCE_DELAY);
  }, [updateNodeData]);

  // Immediate update for dropdowns, switches, etc.
  const immediateUpdate = useCallback((nodeId: string, field: string, value: any) => {
    // Clear any pending debounced updates for this field
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    updateNodeData(nodeId, { [field]: value });
  }, [updateNodeData]);

  // Handle text input changes (debounced)
  const handleTextChange = useCallback((field: string, value: string) => {
    if (!selectedNode) return;
    
    // Update local state immediately for smooth typing
    setLocalData(prev => ({ ...prev, [field]: value }));
    
    // Debounce store update
    debouncedUpdate(selectedNode.id, field, value);
  }, [selectedNode, debouncedUpdate]);

  // Handle select/switch changes (immediate)
  const handleImmediateChange = useCallback((field: string, value: any) => {
    if (!selectedNode) return;
    
    // Update both local state and store immediately
    setLocalData(prev => ({ ...prev, [field]: value }));
    immediateUpdate(selectedNode.id, field, value);
  }, [selectedNode, immediateUpdate]);

  if (!selectedNode) {
    return (
      <Card className="p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Icons.MousePointerClick className="size-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            {t('properties.selectNodeToEdit')}
          </p>
        </div>
      </Card>
    );
  }

  const handleDelete = () => {
    if (confirm(t('properties.deleteConfirm', { label: selectedNode.data.label }))) {
      deleteNode(selectedNode.id);
    }
  };

  return (
    <Card className="p-4 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">{t('properties.nodeProperties')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('properties.configureNode')}
          </p>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="label">{t('properties.stepName')}</Label>
            <Input
              id="label"
              value={localData.label || ''}
              onChange={(e) => handleTextChange('label', e.target.value)}
              placeholder={t('properties.enterStepName')}
            />
          </div>

          <div>
            <Label htmlFor="description">{t('properties.description')}</Label>
            <Textarea
              id="description"
              value={localData.description || ''}
              onChange={(e) => handleTextChange('description', e.target.value)}
              placeholder={t('properties.describeStep')}
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Decision Configuration */}
        {selectedNode.type === 'decision' && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t('properties.decisionLogic')}</h4>
              
              <ConditionEditor
                value={localData.condition || ''}
                onChange={(value) => handleTextChange('condition', value)}
                label={t('properties.condition')}
                placeholder={t('properties.conditionPlaceholder')}
                customFieldKeys={[]}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <div className="size-2 rounded-full bg-green-500" />
                    {t('properties.yesTrue')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('properties.rightHandle')}</p>
                </div>
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-1 text-xs font-medium text-red-700">
                    <div className="size-2 rounded-full bg-red-500" />
                    {t('properties.noFalse')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('properties.bottomHandle')}</p>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Approval Configuration */}
        {selectedNode.type === 'approval' && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t('properties.approvalSettings')}</h4>
              
              <div>
                <Label htmlFor="approvalType">{t('properties.approvalType')}</Label>
                <Select
                  value={localData.approvalType || 'ANY'}
                  onValueChange={(value) => handleImmediateChange('approvalType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('properties.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">{t('properties.anyApprover')}</SelectItem>
                    <SelectItem value="ALL">{t('properties.allApprovers')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('properties.approvalTypeDescription')}
                </p>
              </div>

              <div>
                <Label htmlFor="approvers">{t('properties.approvers')}</Label>
                <Select
                  value={localData.approvers?.[0] || ''}
                  onValueChange={(value) => {
                    const currentApprovers = localData.approvers || [];
                    if (!currentApprovers.includes(value)) {
                      handleImmediateChange('approvers', [...currentApprovers, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('properties.addApprover')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="QUALITY_MANAGER">Quality Manager</SelectItem>
                    <SelectItem value="PROCESS_OWNER">Process Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {localData.approvers && localData.approvers.length > 0 && (
                <div className="space-y-1">
                  <Label>Selected Approvers</Label>
                  {localData.approvers.map((approver: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-muted rounded px-2 py-1">
                      <span className="text-sm">{approver}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newApprovers = localData.approvers.filter((_: string, i: number) => i !== index);
                          handleImmediateChange('approvers', newApprovers);
                        }}
                      >
                        <Icons.X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <div className="size-2 rounded-full bg-green-500" />
                    Approved
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Right handle</p>
                </div>
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-1 text-xs font-medium text-red-700">
                    <div className="size-2 rounded-full bg-red-500" />
                    Rejected
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Bottom handle</p>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Assignment (only for process nodes) */}
        {selectedNode.type === 'process' && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t('properties.assignment')}</h4>
              
              <RoleSelector
                value={localData.assignedRole || ''}
                onChange={(value) => handleImmediateChange('assignedRole', value)}
                label={t('properties.assignedTo')}
                placeholder={t('properties.selectRoleUserDepartment')}
                showDynamic={true}
                showUsers={true}
                showDepartments={true}
              />

              <div>
                <Label htmlFor="deadline">{t('properties.deadline')}</Label>
                <Input
                  id="deadline"
                  type="number"
                  min="1"
                  value={localData.deadlineHours || 24}
                  onChange={(e) => handleImmediateChange('deadlineHours', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('properties.deadlineDescription')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t('properties.notifications')}</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="notify-assign">{t('properties.onAssignment')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('properties.notifyWhenAssigned')}
                  </p>
                </div>
                <Switch
                  id="notify-assign"
                  checked={localData.notifications?.onAssign ?? true}
                  onCheckedChange={(checked) =>
                    handleImmediateChange('notifications', {
                      ...localData.notifications,
                      onAssign: checked,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="notify-before">{t('properties.beforeDeadline')}</Label>
                <Input
                  id="notify-before"
                  type="number"
                  min="0"
                  value={localData.notifications?.beforeDeadline || 2}
                  onChange={(e) =>
                    handleImmediateChange('notifications', {
                      ...localData.notifications,
                      beforeDeadline: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  0 = disabled
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="notify-overdue">On Overdue</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when deadline passed
                  </p>
                </div>
                <Switch
                  id="notify-overdue"
                  checked={localData.notifications?.onOverdue ?? true}
                  onCheckedChange={(checked) =>
                    handleImmediateChange('notifications', {
                      ...localData.notifications,
                      onOverdue: checked,
                    })
                  }
                />
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
          >
            <Icons.Trash className="size-4 mr-2" />
            {t('properties.deleteNode')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
