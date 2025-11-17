/**
 * VALIDATION ENGINE
 * Converts JSON Schema to Zod validators
 * Provides runtime validation for form submissions
 */

import { z } from 'zod';
import { FormSchema, JSONSchemaProperty, ValidationResult, ValidationError } from '../types/json-schema';

/**
 * Convert JSON Schema property to Zod schema
 */
export function jsonSchemaPropertyToZod(property: JSONSchemaProperty, fieldName: string): z.ZodType {
  let schema: any;

  // Base type
  switch (property.type) {
    case 'string':
      schema = z.string();
      
      // String validations
      if (property.minLength) {
        schema = schema.min(property.minLength, `Must be at least ${property.minLength} characters`);
      }
      if (property.maxLength) {
        schema = schema.max(property.maxLength, `Must be at most ${property.maxLength} characters`);
      }
      if (property.pattern) {
        schema = schema.regex(new RegExp(property.pattern), 'Invalid format');
      }
      
      // Format validations
      if (property.format === 'email') {
        schema = schema.email('Invalid email address');
      }
      if (property.format === 'uri' || property.format === 'url') {
        schema = schema.url('Invalid URL');
      }
      if (property.format === 'date') {
        schema = schema.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');
      }
      if (property.format === 'date-time') {
        schema = schema.datetime('Invalid datetime format');
      }
      
      break;

    case 'number':
    case 'integer':
      schema = property.type === 'integer' ? z.number().int() : z.number();
      
      if (property.minimum !== undefined) {
        schema = schema.min(property.minimum, `Must be at least ${property.minimum}`);
      }
      if (property.maximum !== undefined) {
        schema = schema.max(property.maximum, `Must be at most ${property.maximum}`);
      }
      if (property.multipleOf) {
        schema = schema.multipleOf(property.multipleOf, `Must be a multiple of ${property.multipleOf}`);
      }
      
      break;

    case 'boolean':
      schema = z.boolean();
      break;

    case 'array':
      let itemSchema = z.any();
      if (property.items) {
        itemSchema = jsonSchemaPropertyToZod(property.items, `${fieldName}_item`);
      }
      
      schema = z.array(itemSchema);
      
      if (property.minItems) {
        schema = schema.min(property.minItems, `Must have at least ${property.minItems} items`);
      }
      if (property.maxItems) {
        schema = schema.max(property.maxItems, `Must have at most ${property.maxItems} items`);
      }
      
      break;

    case 'object':
      schema = z.object({});
      break;

    default:
      schema = z.any();
  }

  // Enum validation
  if (property.enum && property.enum.length > 0) {
    schema = z.enum(property.enum as [string, ...string[]]);
  }

  // Make optional if not in required list (handled at form level)
  // Default value
  if (property.default !== undefined) {
    schema = schema.default(property.default);
  }

  return schema;
}

/**
 * Convert complete form schema to Zod schema
 */
export function formSchemaToZod(formSchema: FormSchema): z.ZodObject<any> {
  const zodSchema: Record<string, z.ZodType> = {};

  // Convert each property
  Object.entries(formSchema.properties).forEach(([fieldName, property]) => {
    let fieldSchema = jsonSchemaPropertyToZod(property, fieldName);

    // Check if required
    const isRequired = formSchema.required?.includes(fieldName);
    if (!isRequired) {
      fieldSchema = fieldSchema.optional();
    }

    zodSchema[fieldName] = fieldSchema;
  });

  return z.object(zodSchema);
}

/**
 * Validate form data against schema
 */
export function validateFormData(
  schema: FormSchema,
  data: Record<string, any>
): ValidationResult {
  try {
    const zodSchema = formSchemaToZod(schema);
    zodSchema.parse(data);
    
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        type: getValidationType(err.code),
      }));

      return {
        valid: false,
        errors,
      };
    }

    return {
      valid: false,
      errors: [{
        field: 'form',
        message: 'Validation failed',
        type: 'custom',
      }],
    };
  }
}

/**
 * Map Zod error code to validation type
 */
function getValidationType(code: string): ValidationError['type'] {
  switch (code) {
    case 'too_small':
      return 'minLength';
    case 'too_big':
      return 'maxLength';
    case 'invalid_string':
      return 'pattern';
    default:
      return 'custom';
  }
}

/**
 * Validate single field
 */
export function validateField(
  property: JSONSchemaProperty,
  value: any,
  fieldName: string
): ValidationResult {
  try {
    const zodSchema = jsonSchemaPropertyToZod(property, fieldName);
    zodSchema.parse(value);
    
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((err) => ({
          field: fieldName,
          message: err.message,
          type: getValidationType(err.code),
        })),
      };
    }

    return {
      valid: false,
      errors: [{
        field: fieldName,
        message: 'Validation failed',
        type: 'custom',
      }],
    };
  }
}

/**
 * Check if field should be shown based on conditional logic
 */
export function evaluateConditional(
  conditional: NonNullable<JSONSchemaProperty['ui:conditional']>,
  formData: Record<string, any>
): boolean {
  const fieldValue = formData[conditional.field];
  const compareValue = conditional.value;

  switch (conditional.operator) {
    case '==':
      return fieldValue === compareValue;
    case '!=':
      return fieldValue !== compareValue;
    case '>':
      return fieldValue > compareValue;
    case '<':
      return fieldValue < compareValue;
    case '>=':
      return fieldValue >= compareValue;
    case '<=':
      return fieldValue <= compareValue;
    case 'contains':
      return String(fieldValue).includes(String(compareValue));
    case 'notContains':
      return !String(fieldValue).includes(String(compareValue));
    default:
      return true;
  }
}
