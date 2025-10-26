# ⚛️ STEP 3: REACT COMPONENTS

**Phase:** Foundation  
**Duration:** 3-4 days  
**Dependencies:** Server Actions (Step 2)

---

## **🎯 OBJECTIVES:**

- HybridForm wrapper component
- DynamicFieldRenderer for each field type
- Validation integration
- Loading states

---

## **📁 FILE STRUCTURE:**

```
src/components/forms/
├── HybridForm.tsx              (Main wrapper)
├── DynamicFieldRenderer.tsx    (Field type dispatcher)
├── fields/
│   ├── TextField.tsx
│   ├── NumberField.tsx
│   ├── SelectField.tsx
│   ├── DateField.tsx
│   ├── TextareaField.tsx
│   ├── CheckboxField.tsx
│   ├── FileField.tsx
│   └── UserPickerField.tsx
└── CustomFieldsSection.tsx     (Grouped custom fields)
```

---

## **1️⃣ HYBRID FORM (Main Wrapper):**

```typescript
// src/components/forms/HybridForm.tsx

'use client';

import { useEffect, useState } from 'react';
import { getCustomFieldDefinitions } from '@/server/actions/custom-field-definition-actions';
import { getCustomFieldValues, saveCustomFieldValues } from '@/server/actions/custom-field-value-actions';
import { CustomFieldsSection } from './CustomFieldsSection';
import type { CustomFieldDefinition } from '@/lib/types';

interface HybridFormProps {
  entityType: 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF';
  entityId?: string; // For edit mode
  coreFields: React.ReactNode;
  onSubmit: (data: { core: any; custom: Record<string, any> }) => Promise<void>;
  children?: React.ReactNode;
}

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
      const result = await getCustomFieldDefinitions(entityType);
      if (result.success && result.data) {
        setCustomFields(result.data);
      }
      setIsLoading(false);
    }
    loadFields();
  }, [entityType]);

  // Load existing values (edit mode)
  useEffect(() => {
    if (entityId) {
      async function loadValues() {
        const result = await getCustomFieldValues(entityType, entityId);
        if (result.success && result.data) {
          setCustomValues(result.data);
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

  const handleFormSubmit = async (coreData: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        core: coreData,
        custom: customValues,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
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
```

---

## **2️⃣ CUSTOM FIELDS SECTION:**

```typescript
// src/components/forms/CustomFieldsSection.tsx

'use client';

import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CustomFieldDefinition } from '@/lib/types';

interface CustomFieldsSectionProps {
  fields: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (fieldKey: string, value: any) => void;
  disabled?: boolean;
}

export function CustomFieldsSection({
  fields,
  values,
  onChange,
  disabled,
}: CustomFieldsSectionProps) {
  // Group by section
  const sections = fields.reduce((acc, field) => {
    const section = field.section || 'Additional Information';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, CustomFieldDefinition[]>);

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([sectionName, sectionFields]) => (
        <Card key={sectionName}>
          <CardHeader>
            <CardTitle className="text-lg">{sectionName}</CardTitle>
            <Separator className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionFields.map(field => (
              <DynamicFieldRenderer
                key={field.id}
                field={field}
                value={values[field.fieldKey]}
                onChange={(value) => onChange(field.fieldKey, value)}
                disabled={disabled}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## **3️⃣ DYNAMIC FIELD RENDERER:**

```typescript
// src/components/forms/DynamicFieldRenderer.tsx

'use client';

import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { DateField } from './fields/DateField';
import { TextareaField } from './fields/TextareaField';
import { CheckboxField } from './fields/CheckboxField';
import { FileField } from './fields/FileField';
import { UserPickerField } from './fields/UserPickerField';
import type { CustomFieldDefinition } from '@/lib/types';

interface DynamicFieldRendererProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: DynamicFieldRendererProps) {
  const commonProps = {
    field,
    value,
    onChange,
    disabled,
  };

  switch (field.fieldType) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
      return <TextField {...commonProps} />;

    case 'number':
      return <NumberField {...commonProps} />;

    case 'textarea':
      return <TextareaField {...commonProps} />;

    case 'select':
    case 'radio':
      return <SelectField {...commonProps} />;

    case 'checkbox':
      return <CheckboxField {...commonProps} />;

    case 'date':
    case 'datetime':
    case 'time':
      return <DateField {...commonProps} />;

    case 'file':
    case 'files':
      return <FileField {...commonProps} />;

    case 'user-picker':
      return <UserPickerField {...commonProps} />;

    default:
      console.warn(`Unsupported field type: ${field.fieldType}`);
      return null;
  }
}
```

---

## **4️⃣ FIELD TYPE COMPONENTS:**

### **Text Field:**

```typescript
// src/components/forms/fields/TextField.tsx

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomFieldDefinition } from '@/lib/types';

interface TextFieldProps {
  field: CustomFieldDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextField({ field, value, onChange, disabled }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={field.fieldKey}
        type={field.fieldType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
        pattern={field.validation?.pattern}
      />
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
```

### **Number Field:**

```typescript
// src/components/forms/fields/NumberField.tsx

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomFieldDefinition } from '@/lib/types';

interface NumberFieldProps {
  field: CustomFieldDefinition;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function NumberField({ field, value, onChange, disabled }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={field.fieldKey}
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        min={field.validation?.min}
        max={field.validation?.max}
      />
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
```

### **Select Field:**

```typescript
// src/components/forms/fields/SelectField.tsx

'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { CustomFieldDefinition } from '@/lib/types';

interface SelectFieldProps {
  field: CustomFieldDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SelectField({ field, value, onChange, disabled }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        required={field.required}
      >
        <SelectTrigger id={field.fieldKey}>
          <SelectValue placeholder={field.placeholder || 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
```

---

## **✅ CHECKLIST:**

- [ ] Create `HybridForm.tsx`
- [ ] Create `CustomFieldsSection.tsx`
- [ ] Create `DynamicFieldRenderer.tsx`
- [ ] Create all field type components
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Test with various field types
- [ ] Test validation
- [ ] Add Storybook stories (optional)

---

**Status:** ✅ Components ready  
**Next:** [Admin UI](./04-ADMIN-UI.md)
