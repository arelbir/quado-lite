'use client';

/**
 * CUSTOM FIELDS REFERENCE PANEL
 * Shows available custom fields for the current module
 * Helps users understand how to use custom fields in conditions
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { Separator } from '@/components/ui/separator';
import { getCustomFieldDefinitions } from '@/features/custom-fields/actions/definition-actions';
import type { CustomFieldDefinition, EntityType } from '@/lib/types';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';

interface CustomFieldsReferenceProps {
  module?: EntityType | '';
}

export function CustomFieldsReference({ module }: CustomFieldsReferenceProps) {
  const t = useTranslations('workflow');
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!module) {
      setFields([]);
      setError(null);
      return;
    }

    async function loadFields() {
      setLoading(true);
      setError(null);
      try {
        const result = await getCustomFieldDefinitions(module as EntityType);
        if (result.success && result.data) {
          setFields(result.data);
        } else {
          setError('Failed to load custom fields');
        }
      } catch (err) {
        setError('Failed to load custom fields');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFields();
  }, [module]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'url':
        return '📝';
      case 'number':
        return '🔢';
      case 'select':
      case 'multiselect':
      case 'radio':
        return '📋';
      case 'checkbox':
        return '☑️';
      case 'date':
      case 'datetime':
        return '📅';
      default:
        return '📌';
    }
  };

  const getExampleUsage = (field: CustomFieldDefinition) => {
    const fieldPath = `customFields.${field.fieldKey}`;
    
    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'url':
        return [`${fieldPath} !== undefined`, `${fieldPath} === 'specific-value'`];
      case 'number':
        return [`${fieldPath} > 100`, `${fieldPath} >= 50 AND ${fieldPath} <= 100`];
      case 'checkbox':
        return [`${fieldPath} === true`, `${fieldPath} === false`];
      case 'select':
      case 'radio':
        return [`${fieldPath} === '${field.options?.[0]?.value || 'option1'}'`];
      case 'date':
        return [`${fieldPath} !== undefined`];
      default:
        return [`${fieldPath} !== undefined`];
    }
  };

  if (!module) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-sm text-muted-foreground">
            <Icons.AlertCircle className="size-12 mx-auto mb-2 opacity-50" />
            <p>{t('customFields.moduleNotSelected')}</p>
            <p className="text-xs mt-1">{t('customFields.setModuleToSeeFields')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Icons.Loader2 className="size-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('customFields.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-sm text-destructive">
            <Icons.AlertCircle className="size-12 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('customFields.title')}</CardTitle>
          <CardDescription>{t('customFields.description', { module })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            <Icons.FileQuestion className="size-12 mx-auto mb-2 opacity-50" />
            <p>{t('customFields.noFieldsDefined')}</p>
            <p className="text-xs mt-1">
              {t('customFields.createFieldsInAdmin')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{t('customFields.referenceTitle')}</span>
          <Badge variant="outline">{t('customFields.fieldsCount', { count: fields.length })}</Badge>
        </CardTitle>
        <CardDescription>{t('customFields.availableFor', { module })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Accordion type="single" collapsible className="w-full">
          {fields.map((field, index) => (
            <AccordionItem key={field.id} value={`field-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <span>{getFieldTypeIcon(field.fieldType)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{field.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {field.fieldKey}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {field.fieldType}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {/* Field Info */}
                  {field.helpText && (
                    <div className="text-xs text-muted-foreground">
                      {field.helpText}
                    </div>
                  )}

                  {/* Usage Path */}
                  <div>
                    <div className="text-xs font-medium mb-1">{t('customFields.usagePath')}:</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted px-2 py-1 rounded text-xs">
                        customFields.{field.fieldKey}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`customFields.${field.fieldKey}`)}
                      >
                        <Icons.File className="size-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Options (for select fields) */}
                  {(field.fieldType === 'select' || field.fieldType === 'radio') && field.options && (
                    <div>
                      <div className="text-xs font-medium mb-1">{t('customFields.options')}:</div>
                      <div className="flex flex-wrap gap-1">
                        {field.options.map((opt: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {opt.label || opt.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  <div>
                    <div className="text-xs font-medium mb-1">{t('customFields.examples')}:</div>
                    <div className="space-y-1">
                      {getExampleUsage(field).map((example, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <code className="flex-1 bg-muted px-2 py-1 rounded text-xs">
                            {example}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(example)}
                          >
                            <Icons.File className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Separator />

        {/* Quick Guide */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-xs space-y-2">
          <div className="font-medium flex items-center gap-2">
            <Icons.Info className="size-4" />
            Quick Tips:
          </div>
          <ul className="space-y-1 text-muted-foreground pl-6 list-disc">
            <li>Use <code className="bg-background px-1 rounded">customFields.fieldName</code> in conditions</li>
            <li>Combine with operators: <code className="bg-background px-1 rounded">===</code>, <code className="bg-background px-1 rounded">&gt;</code>, <code className="bg-background px-1 rounded">!==</code></li>
            <li>Use <code className="bg-background px-1 rounded">AND</code> / <code className="bg-background px-1 rounded">OR</code> for complex logic</li>
            <li>Click copy button to copy examples</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
