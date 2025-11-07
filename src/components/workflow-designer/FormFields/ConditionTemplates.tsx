'use client';

/**
 * CONDITION TEMPLATES
 * Pre-built condition templates for common scenarios
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from 'next-intl';

interface Template {
  name: string;
  description: string;
  condition: string;
  category: string;
}

const TEMPLATES: Template[] = [
  // Status checks
  {
    name: 'Approved Status',
    description: 'Check if status is approved',
    condition: "status === 'approved'",
    category: 'Status',
  },
  {
    name: 'Rejected Status',
    description: 'Check if status is rejected',
    condition: "status === 'rejected'",
    category: 'Status',
  },
  
  // Score/Number checks
  {
    name: 'High Score',
    description: 'Score greater than 80',
    condition: 'score > 80',
    category: 'Score',
  },
  {
    name: 'Score Range',
    description: 'Score between 50 and 80',
    condition: 'score >= 50 AND score <= 80',
    category: 'Score',
  },
  
  // Risk checks
  {
    name: 'High Risk',
    description: 'High risk level',
    condition: "riskLevel === 'high'",
    category: 'Risk',
  },
  {
    name: 'Not Low Risk',
    description: 'Medium or high risk',
    condition: "riskLevel !== 'low'",
    category: 'Risk',
  },
  
  // Priority checks
  {
    name: 'High Priority',
    description: 'High priority items',
    condition: "priority === 'high'",
    category: 'Priority',
  },
  
  // Custom field checks
  {
    name: 'Custom Field Exists',
    description: 'Check if custom field has value',
    condition: 'customFields.fieldName !== undefined',
    category: 'Custom Fields',
  },
  {
    name: 'Custom Field Equals',
    description: 'Custom field equals specific value',
    condition: "customFields.fieldName === 'value'",
    category: 'Custom Fields',
  },
  {
    name: 'Custom Field Number Check',
    description: 'Custom field numeric comparison',
    condition: 'customFields.fieldName > 100',
    category: 'Custom Fields',
  },
  
  // Combined conditions
  {
    name: 'High Score AND Approved',
    description: 'Both conditions must be true',
    condition: "score > 80 AND status === 'approved'",
    category: 'Combined',
  },
  {
    name: 'High Risk OR Low Score',
    description: 'Either condition can be true',
    condition: "riskLevel === 'high' OR score < 50",
    category: 'Combined',
  },
];

interface ConditionTemplatesProps {
  onSelect: (condition: string) => void;
}

export function ConditionTemplates({ onSelect }: ConditionTemplatesProps) {
  const t = useTranslations('workflow');
  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Icons.FileText className="size-4 mr-2" />
          {t('templates.chooseFromTemplate')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">{t('templates.title')}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t('templates.description')}
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {categories.map((category) => (
            <div key={category} className="mb-3">
              <div className="px-2 py-1">
                <Badge variant="outline" className="text-xs">{category}</Badge>
              </div>
              <div className="space-y-1">
                {TEMPLATES.filter(t => t.category === category).map((template, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(template.condition)}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {template.description}
                    </div>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded block font-mono">
                      {template.condition}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
