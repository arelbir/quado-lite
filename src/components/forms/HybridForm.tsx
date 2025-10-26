'use client';

import { useEffect, useState } from 'react';
import { getCustomFieldDefinitions } from '@/server/actions/custom-field-definition-actions';
import { getCustomFieldValues } from '@/server/actions/custom-field-value-actions';
import { CustomFieldsSection } from './CustomFieldsSection';
import type { CustomFieldDefinition, EntityType } from '@/lib/types';

interface HybridFormProps {
  entityType: EntityType;
  entityId?: string; // For edit mode
  coreFields: React.ReactNode;
  onSubmit: (data: { core: any; custom: Record<string, any> }) => Promise<void>;
  children?: React.ReactNode;
}

/**
 * HybridForm - Combines static core fields with dynamic custom fields
 * 
 * Usage:
 * <HybridForm
 *   entityType="AUDIT"
 *   entityId={auditId} // optional for edit
 *   coreFields={<CoreFieldsForm />}
 *   onSubmit={handleSubmit}
 * >
 *   <Button type="submit">Save</Button>
 * </HybridForm>
 */
export function HybridForm({
  entityType,
  entityId,
  coreFields,
  onSubmit,
  children,
}: HybridFormProps) {
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load custom field definitions
  useEffect(() => {
    async function loadFields() {
      setIsLoading(true);
      try {
        const result = await getCustomFieldDefinitions(entityType);
        if (result.success && result.data) {
          setCustomFields(result.data);
        }
      } catch (error) {
        console.error('Failed to load custom fields:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFields();
  }, [entityType]);

  // Load existing values (edit mode)
  useEffect(() => {
    if (entityId) {
      async function loadValues() {
        try {
          const result = await getCustomFieldValues(entityType, entityId!);
          if (result.success && result.data) {
            setCustomValues(result.data);
          }
        } catch (error) {
          console.error('Failed to load custom values:', error);
        }
      }
      loadValues();
    }
  }, [entityType, entityId]);

  const handleCustomFieldChange = (fieldKey: string, value: any) => {
    setCustomValues(prev => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  // Expose custom values for parent form submission
  const getCustomValues = () => customValues;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Core fields (passed as children) */}
      <div className="space-y-4">
        {coreFields}
      </div>

      {/* Custom fields section */}
      {customFields.length > 0 && (
        <CustomFieldsSection
          fields={customFields}
          values={customValues}
          onChange={handleCustomFieldChange}
          disabled={isSubmitting}
        />
      )}

      {/* Additional children (like submit button) */}
      {children}
    </div>
  );
}

// Export helper hook for accessing custom values
export function useHybridFormValues() {
  return useState<Record<string, any>>({});
}
