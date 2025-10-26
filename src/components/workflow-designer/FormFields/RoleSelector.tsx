'use client';

/**
 * ROLE SELECTOR - Smart Assignment Component
 * Allows selecting from:
 * - System Roles (from database)
 * - Specific Users
 * - Department Managers
 * - Dynamic (custom field based)
 */

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getWorkflowRoles, getWorkflowUsers, getWorkflowDepartments } from '@/server/actions/workflow-data-actions';

// Static dynamic assignment templates (no need for server action)
const DYNAMIC_ASSIGNMENT_TEMPLATES = [
  {
    value: '${customFields.approverRole}',
    label: 'Dynamic: Approver Role',
    description: 'Use approverRole from custom fields',
  },
  {
    value: '${customFields.assignedUserId}',
    label: 'Dynamic: Assigned User',
    description: 'Use assignedUserId from custom fields',
  },
  {
    value: '${customFields.departmentManager}',
    label: 'Dynamic: Department Manager',
    description: 'Use departmentManager from custom fields',
  },
  {
    value: '${metadata.createdBy}',
    label: 'Dynamic: Creator',
    description: 'Assign to whoever created the record',
  },
  {
    value: '${metadata.departmentManager}',
    label: 'Dynamic: Record Department Manager',
    description: 'Assign to the manager of the record department',
  },
];

interface RoleSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showDynamic?: boolean;
  showUsers?: boolean;
  showDepartments?: boolean;
}

export function RoleSelector({
  value,
  onChange,
  label = 'Assigned Role',
  placeholder = 'Select assignment...',
  showDynamic = true,
  showUsers = true,
  showDepartments = true,
}: RoleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<Array<{ value: string; label: string; description?: string }>>([]);
  const [users, setUsers] = useState<Array<{ value: string; label: string; email?: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([]);
  const dynamicTemplates = DYNAMIC_ASSIGNMENT_TEMPLATES;
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load roles
        const rolesResult = await getWorkflowRoles();
        if (rolesResult.success && rolesResult.data) {
          setRoles(rolesResult.data);
        }

        // Load users if enabled
        if (showUsers) {
          const usersResult = await getWorkflowUsers();
          if (usersResult.success && usersResult.data) {
            setUsers(usersResult.data);
          }
        }

        // Load departments if enabled
        if (showDepartments) {
          const deptsResult = await getWorkflowDepartments();
          if (deptsResult.success && deptsResult.data) {
            setDepartments(deptsResult.data);
          }
        }
      } catch (error) {
        console.error('Error loading workflow data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [showUsers, showDepartments]);

  // Get display value
  const getDisplayValue = () => {
    if (!value) return placeholder;

    // Check roles
    const role = roles.find(r => r.value === value);
    if (role) return role.label;

    // Check users
    const user = users.find(u => u.value === value);
    if (user) return user.label;

    // Check departments
    const dept = departments.find(d => d.value === value);
    if (dept) return dept.label;

    // Check dynamic
    const dynamic = dynamicTemplates.find((d: typeof DYNAMIC_ASSIGNMENT_TEMPLATES[0]) => d.value === value);
    if (dynamic) return dynamic.label;

    // Return as-is
    return value;
  };

  // Get badge variant
  const getBadgeVariant = () => {
    if (!value) return 'outline';
    if (value.startsWith('user:')) return 'secondary';
    if (value.startsWith('dept:')) return 'default';
    if (value.startsWith('${')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">{getDisplayValue()}</span>
            <Icons.ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search roles, users, departments..." />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Loading...' : 'No results found.'}
              </CommandEmpty>

              {/* System Roles */}
              {roles.length > 0 && (
                <>
                  <CommandGroup heading="📋 System Roles">
                    {roles.map((role) => (
                      <CommandItem
                        key={role.value}
                        value={role.value}
                        onSelect={() => {
                          onChange(role.value);
                          setOpen(false);
                        }}
                      >
                        <Icons.Check
                          className={`mr-2 size-4 ${
                            value === role.value ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{role.label}</div>
                          {role.description && (
                            <div className="text-xs text-muted-foreground">
                              {role.description}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Specific Users */}
              {showUsers && users.length > 0 && (
                <>
                  <CommandGroup heading="👤 Specific Users">
                    {users.slice(0, 10).map((user) => (
                      <CommandItem
                        key={user.value}
                        value={user.value}
                        onSelect={() => {
                          onChange(user.value);
                          setOpen(false);
                        }}
                      >
                        <Icons.Check
                          className={`mr-2 size-4 ${
                            value === user.value ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{user.label}</div>
                          {user.email && (
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {users.length > 10 && (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        +{users.length - 10} more users...
                      </div>
                    )}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Department Managers */}
              {showDepartments && departments.length > 0 && (
                <>
                  <CommandGroup heading="🏢 Department Managers">
                    {departments.map((dept) => (
                      <CommandItem
                        key={dept.value}
                        value={dept.value}
                        onSelect={() => {
                          onChange(dept.value);
                          setOpen(false);
                        }}
                      >
                        <Icons.Check
                          className={`mr-2 size-4 ${
                            value === dept.value ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <div>{dept.label}</div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Dynamic Templates */}
              {showDynamic && dynamicTemplates.length > 0 && (
                <CommandGroup heading="⚡ Dynamic Assignment">
                  {dynamicTemplates.map((template: typeof DYNAMIC_ASSIGNMENT_TEMPLATES[0]) => (
                    <CommandItem
                      key={template.value}
                      value={template.value}
                      onSelect={() => {
                        onChange(template.value);
                        setOpen(false);
                      }}
                    >
                      <Icons.Check
                        className={`mr-2 size-4 ${
                          value === template.value ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium font-mono text-xs">
                          {template.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Current Selection Info */}
      {value && (
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant()} className="text-xs">
            {value.startsWith('user:') && '👤 User'}
            {value.startsWith('dept:') && '🏢 Department'}
            {value.startsWith('${') && '⚡ Dynamic'}
            {!value.startsWith('user:') && !value.startsWith('dept:') && !value.startsWith('${') && '📋 Role'}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono truncate">
            {value}
          </span>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        💡 Tip: Use dynamic assignment to assign based on custom fields
      </p>
    </div>
  );
}
