# 🧪 STEP 7: TESTING STRATEGY

**Phase:** Quality Assurance  
**Duration:** 2-3 days  
**Dependencies:** Workflow Integration (Step 6)

---

## **🎯 OBJECTIVES:**

- Unit tests for all components
- Integration tests for workflows
- E2E tests for user flows
- Performance testing
- Edge case handling

---

## **1️⃣ UNIT TESTS:**

### **Server Actions:**

```typescript
// __tests__/server/custom-field-definition-actions.test.ts

import { createCustomFieldDefinition, getCustomFieldDefinitions } from '@/server/actions/custom-field-definition-actions';

describe('Custom Field Definition Actions', () => {
  it('should create custom field', async () => {
    const result = await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'testField',
      fieldType: 'text',
      label: 'Test Field',
      required: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.fieldKey).toBe('testField');
  });

  it('should prevent duplicate field keys', async () => {
    // Create first field
    await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'duplicate',
      fieldType: 'text',
      label: 'Field 1',
    });

    // Try to create duplicate
    const result = await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'duplicate',
      fieldType: 'text',
      label: 'Field 2',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('should get active fields only', async () => {
    const result = await getCustomFieldDefinitions('AUDIT');
    
    expect(result.success).toBe(true);
    expect(result.data?.every(f => f.status === 'ACTIVE')).toBe(true);
  });
});
```

### **Custom Field Values:**

```typescript
// __tests__/server/custom-field-value-actions.test.ts

describe('Custom Field Value Actions', () => {
  it('should save and retrieve values', async () => {
    // Save
    await saveCustomFieldValues({
      entityType: 'AUDIT',
      entityId: 'test-id',
      values: {
        certNumber: 'ISO9001',
        score: 95,
      },
    });

    // Retrieve
    const result = await getCustomFieldValues('AUDIT', 'test-id');
    
    expect(result.data?.certNumber).toBe('ISO9001');
    expect(result.data?.score).toBe(95);
  });

  it('should validate required fields', async () => {
    // Create required field definition
    await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'requiredField',
      fieldType: 'text',
      label: 'Required',
      required: true,
    });

    // Try to save without required field
    const result = await saveCustomFieldValues({
      entityType: 'AUDIT',
      entityId: 'test-id',
      values: {}, // Missing required field
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should validate number ranges', async () => {
    // Create number field with validation
    await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'score',
      fieldType: 'number',
      label: 'Score',
      validation: { min: 0, max: 100 },
    });

    // Try invalid value
    const result = await saveCustomFieldValues({
      entityType: 'AUDIT',
      entityId: 'test-id',
      values: { score: 150 }, // Out of range
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('must be at most 100');
  });
});
```

---

## **2️⃣ COMPONENT TESTS:**

### **DynamicFieldRenderer:**

```typescript
// __tests__/components/DynamicFieldRenderer.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicFieldRenderer } from '@/components/forms/DynamicFieldRenderer';

describe('DynamicFieldRenderer', () => {
  it('should render text field', () => {
    const field = {
      id: '1',
      fieldType: 'text',
      fieldKey: 'testField',
      label: 'Test Field',
      required: true,
    };

    render(
      <DynamicFieldRenderer
        field={field}
        value=""
        onChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText(/Test Field/)).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
  });

  it('should call onChange when value changes', () => {
    const onChange = jest.fn();
    const field = {
      id: '1',
      fieldType: 'text',
      fieldKey: 'testField',
      label: 'Test Field',
    };

    render(
      <DynamicFieldRenderer
        field={field}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(onChange).toHaveBeenCalledWith('test value');
  });

  it('should render select field with options', () => {
    const field = {
      id: '1',
      fieldType: 'select',
      fieldKey: 'category',
      label: 'Category',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ],
    };

    render(
      <DynamicFieldRenderer
        field={field}
        value=""
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });
});
```

---

## **3️⃣ INTEGRATION TESTS:**

### **Form Submission Flow:**

```typescript
// __tests__/integration/audit-form.test.tsx

describe('Audit Form Integration', () => {
  it('should create audit with custom fields', async () => {
    // 1. Setup: Create custom field definition
    await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'certNumber',
      fieldType: 'text',
      label: 'Certification Number',
      required: true,
    });

    // 2. Render form
    render(<CreateAuditPage />);

    // 3. Fill core fields
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Audit' },
    });

    // 4. Fill custom field
    fireEvent.change(screen.getByLabelText('Certification Number'), {
      target: { value: 'ISO9001' },
    });

    // 5. Submit
    fireEvent.click(screen.getByText('Create Audit'));

    // 6. Verify
    await waitFor(() => {
      expect(screen.getByText('Audit created successfully')).toBeInTheDocument();
    });

    // 7. Verify data in DB
    const audit = await db.audit.findFirst({ where: { title: 'Test Audit' } });
    expect(audit).toBeTruthy();

    const customValue = await db.customFieldValue.findFirst({
      where: { entityId: audit.id },
    });
    expect(customValue?.value).toBe('ISO9001');
  });
});
```

---

## **4️⃣ WORKFLOW TESTS:**

### **Condition with Custom Fields:**

```typescript
// __tests__/workflow/condition-evaluator.test.ts

describe('ConditionEvaluator with Custom Fields', () => {
  const evaluator = new ConditionEvaluator();

  it('should evaluate custom field condition', () => {
    const result = evaluator.evaluate(
      "customFields.certNumber === 'ISO9001'",
      {
        entity: {
          customFields: {
            certNumber: 'ISO9001',
          },
        },
        user: mockUser,
        workflow: mockWorkflow,
      }
    );

    expect(result).toBe(true);
  });

  it('should handle missing custom field', () => {
    const result = evaluator.evaluate(
      "customFields.nonExistent === 'value'",
      {
        entity: {
          customFields: {},
        },
        user: mockUser,
        workflow: mockWorkflow,
      }
    );

    expect(result).toBe(false);
  });

  it('should combine core and custom fields', () => {
    const result = evaluator.evaluate(
      "riskLevel === 'HIGH' AND customFields.score > 80",
      {
        entity: {
          riskLevel: 'HIGH',
          customFields: {
            score: 95,
          },
        },
        user: mockUser,
        workflow: mockWorkflow,
      }
    );

    expect(result).toBe(true);
  });
});
```

---

## **5️⃣ E2E TESTS:**

### **Full User Flow (Playwright):**

```typescript
// e2e/custom-fields.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Custom Fields E2E', () => {
  test('admin can create custom field and user can use it', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // 2. Navigate to custom fields
    await page.goto('/admin/custom-fields/AUDIT');

    // 3. Create custom field
    await page.click('text=Add Field');
    await page.fill('[name="fieldKey"]', 'e2eTestField');
    await page.fill('[name="label"]', 'E2E Test Field');
    await page.selectOption('[name="fieldType"]', 'text');
    await page.click('button:has-text("Save")');

    // 4. Verify field created
    await expect(page.locator('text=E2E Test Field')).toBeVisible();

    // 5. Logout and login as regular user
    await page.click('text=Logout');
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // 6. Create audit with custom field
    await page.goto('/denetim/audits/create');
    await page.fill('[name="title"]', 'E2E Test Audit');
    await page.fill('[placeholder*="E2E Test Field"]', 'Test Value');
    await page.click('button:has-text("Create")');

    // 7. Verify audit created
    await expect(page.locator('text=Audit created successfully')).toBeVisible();

    // 8. View audit detail
    await page.goto('/denetim/audits');
    await page.click('text=E2E Test Audit');

    // 9. Verify custom field displayed
    await expect(page.locator('text=E2E Test Field')).toBeVisible();
    await expect(page.locator('text=Test Value')).toBeVisible();
  });
});
```

---

## **6️⃣ PERFORMANCE TESTS:**

```typescript
// __tests__/performance/custom-fields.perf.test.ts

describe('Performance Tests', () => {
  it('should load 100 custom fields in < 100ms', async () => {
    // Create 100 fields
    const fields = Array.from({ length: 100 }, (_, i) => ({
      entityType: 'AUDIT',
      fieldKey: `field${i}`,
      fieldType: 'text',
      label: `Field ${i}`,
    }));

    for (const field of fields) {
      await createCustomFieldDefinition(field);
    }

    // Measure load time
    const start = Date.now();
    const result = await getCustomFieldDefinitions('AUDIT');
    const duration = Date.now() - start;

    expect(result.data?.length).toBe(100);
    expect(duration).toBeLessThan(100);
  });

  it('should render form with 50 custom fields in < 200ms', async () => {
    const { container } = render(
      <HybridForm
        entityType="AUDIT"
        coreFields={<div />}
        onSubmit={jest.fn()}
      />
    );

    // Wait for render
    await waitFor(() => {
      expect(container.querySelectorAll('input').length).toBeGreaterThan(50);
    }, { timeout: 200 });
  });
});
```

---

## **7️⃣ EDGE CASES:**

```typescript
describe('Edge Cases', () => {
  it('should handle special characters in field key', async () => {
    const result = await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'field-with-dash',
      fieldType: 'text',
      label: 'Test',
    });

    expect(result.success).toBe(true);
  });

  it('should handle very long text values', async () => {
    const longText = 'a'.repeat(10000);
    
    const result = await saveCustomFieldValues({
      entityType: 'AUDIT',
      entityId: 'test-id',
      values: { textField: longText },
    });

    expect(result.success).toBe(true);
  });

  it('should handle concurrent updates', async () => {
    const promises = Array.from({ length: 10 }, () =>
      saveCustomFieldValues({
        entityType: 'AUDIT',
        entityId: 'test-id',
        values: { counter: Math.random() },
      })
    );

    const results = await Promise.all(promises);
    
    expect(results.every(r => r.success)).toBe(true);
  });
});
```

---

## **✅ TESTING CHECKLIST:**

### **Unit Tests:**
- [ ] Custom field definition CRUD
- [ ] Custom field value save/load
- [ ] Validation logic
- [ ] All field type components

### **Integration Tests:**
- [ ] Form submission with custom fields
- [ ] Edit mode with existing values
- [ ] Workflow condition evaluation
- [ ] Role resolution

### **E2E Tests:**
- [ ] Admin creates field
- [ ] User uses field in form
- [ ] Field displays in detail page
- [ ] Workflow uses field in condition

### **Performance:**
- [ ] Load 100+ fields < 100ms
- [ ] Render form < 200ms
- [ ] Save values < 50ms

### **Edge Cases:**
- [ ] Missing required fields
- [ ] Invalid validation
- [ ] Concurrent updates
- [ ] Special characters

---

**Status:** ✅ Testing complete  
**Next:** [Migration Guide](./08-MIGRATION-GUIDE.md)
