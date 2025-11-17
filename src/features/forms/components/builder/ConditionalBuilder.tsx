'use client';

/**
 * CONDITIONAL LOGIC BUILDER
 * Visual builder for field conditional visibility
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/shared/icons';

export interface ConditionalLogic {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  value: any;
}

interface ConditionalBuilderProps {
  availableFields: Array<{ key: string; label: string; type: string }>;
  value?: ConditionalLogic;
  onChange: (value: ConditionalLogic | undefined) => void;
}

const OPERATORS = [
  { value: '==', label: 'equals' },
  { value: '!=', label: 'not equals' },
  { value: '>', label: 'greater than' },
  { value: '<', label: 'less than' },
  { value: '>=', label: 'greater or equal' },
  { value: '<=', label: 'less or equal' },
  { value: 'contains', label: 'contains' },
];

export function ConditionalBuilder({
  availableFields,
  value,
  onChange,
}: ConditionalBuilderProps) {
  const [isEnabled, setIsEnabled] = useState(!!value);

  const handleToggle = () => {
    if (isEnabled) {
      onChange(undefined);
      setIsEnabled(false);
    } else {
      onChange({
        field: availableFields[0]?.key || '',
        operator: '==',
        value: '',
      });
      setIsEnabled(true);
    }
  };

  const updateCondition = (key: keyof ConditionalLogic, newValue: any) => {
    if (!value) return;
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Conditional Visibility</Label>
        <Button
          type="button"
          variant={isEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggle}
        >
          {isEnabled ? (
            <>
              <Icons.Eye className="size-4 mr-2" />
              Enabled
            </>
          ) : (
            <>
              <Icons.EyeOff className="size-4 mr-2" />
              Disabled
            </>
          )}
        </Button>
      </div>

      {isEnabled && value && (
        <Card className="p-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Show this field when:
            </p>

            {/* Field Selector */}
            <div className="space-y-2">
              <Label>Field</Label>
              <Select
                value={value.field}
                onValueChange={(v) => updateCondition('field', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator Selector */}
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={value.operator}
                onValueChange={(v: any) => updateCondition('operator', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value Input */}
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                value={value.value}
                onChange={(e) => updateCondition('value', e.target.value)}
                placeholder="Enter value"
              />
            </div>

            {/* Preview */}
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-mono">
                Show when{' '}
                <span className="font-semibold">
                  {availableFields.find((f) => f.key === value.field)?.label || value.field}
                </span>{' '}
                <span className="font-semibold">
                  {OPERATORS.find((o) => o.value === value.operator)?.label}
                </span>{' '}
                <span className="font-semibold">"{value.value}"</span>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
