'use client';

/**
 * VISUAL FORMULA BUILDER
 * No-code condition builder for users who don't want to write code
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  connector?: 'AND' | 'OR';
}

interface VisualFormulaBuilderProps {
  onApply: (formula: string) => void;
}

const FIELDS = [
  { value: 'status', label: 'Status' },
  { value: 'score', label: 'Score' },
  { value: 'riskLevel', label: 'Risk Level' },
  { value: 'priority', label: 'Priority' },
  { value: 'type', label: 'Type' },
];

const OPERATORS = [
  { value: '===', label: 'equals (===)' },
  { value: '!==', label: 'not equals (!==)' },
  { value: '>', label: 'greater than (>)' },
  { value: '<', label: 'less than (<)' },
  { value: '>=', label: 'greater or equal (>=)' },
  { value: '<=', label: 'less or equal (<=)' },
];

const COMMON_VALUES = {
  status: ["'approved'", "'rejected'", "'pending'"],
  riskLevel: ["'high'", "'medium'", "'low'"],
  priority: ["'high'", "'medium'", "'low'"],
};

export function VisualFormulaBuilder({ onApply }: VisualFormulaBuilderProps) {
  const [open, setOpen] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: '', operator: '===', value: '', connector: 'AND' },
  ]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Date.now().toString(), field: '', operator: '===', value: '', connector: 'AND' },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const buildFormula = () => {
    const parts = conditions
      .filter(c => c.field && c.value)
      .map((c, index) => {
        const part = `${c.field} ${c.operator} ${c.value}`;
        const nextCondition = conditions[index + 1];
        if (index < conditions.length - 1 && nextCondition && nextCondition.field && nextCondition.value) {
          return `${part} ${c.connector || 'AND'}`;
        }
        return part;
      });
    return parts.join(' ');
  };

  const handleApply = () => {
    const formula = buildFormula();
    if (formula) {
      onApply(formula);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Icons.Settings className="size-4 mr-2" />
          Visual Builder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visual Formula Builder</DialogTitle>
          <DialogDescription>
            Build conditions visually without writing code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {conditions.map((condition, index) => (
            <Card key={condition.id} className="p-4">
              <div className="space-y-3">
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={condition.connector}
                      onValueChange={(value: 'AND' | 'OR') => {
                        const prevCondition = conditions[index - 1];
                        if (prevCondition) {
                          updateCondition(prevCondition.id, { connector: value });
                        }
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="text-xs">
                      {conditions[index - 1]?.connector === 'AND' ? 'Both must be true' : 'Either can be true'}
                    </Badge>
                  </div>
                )}

                <div className="grid grid-cols-12 gap-2">
                  {/* Field */}
                  <div className="col-span-4">
                    <Select
                      value={condition.field}
                      onValueChange={(value) => updateCondition(condition.id, { field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator */}
                  <div className="col-span-4">
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(condition.id, { operator: value })}
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

                  {/* Value */}
                  <div className="col-span-3">
                    {condition.field && COMMON_VALUES[condition.field as keyof typeof COMMON_VALUES] ? (
                      <Select
                        value={condition.value}
                        onValueChange={(value) => updateCondition(condition.id, { value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Value" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_VALUES[condition.field as keyof typeof COMMON_VALUES].map((val) => (
                            <SelectItem key={val} value={val}>
                              {val.replace(/'/g, '')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Value"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      />
                    )}
                  </div>

                  {/* Remove */}
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(condition.id)}
                      disabled={conditions.length === 1}
                    >
                      <Icons.Trash className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Button variant="outline" onClick={addCondition} className="w-full">
            <Icons.Plus className="size-4 mr-2" />
            Add Condition
          </Button>

          {/* Preview */}
          <Card className="p-4 bg-muted/50">
            <div className="text-sm font-medium mb-2">Generated Formula:</div>
            <code className="block bg-background p-2 rounded text-xs font-mono">
              {buildFormula() || 'Add conditions above...'}
            </code>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={!buildFormula()}>
              <Icons.CheckCircle2 className="size-4 mr-2" />
              Apply Formula
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
