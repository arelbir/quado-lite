/**
 * FIELD COMPONENTS INDEX
 * Export all field components
 */

export { TextField } from './TextField';
export { TextAreaField } from './TextAreaField';
export { NumberField } from './NumberField';
export { SelectField } from './SelectField';
export { CheckboxField } from './CheckboxField';
export { DateField } from './DateField';
export { FileField } from './FileField';

// Field component map for dynamic rendering
import { TextField } from './TextField';
import { TextAreaField } from './TextAreaField';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { DateField } from './DateField';
import { FileField } from './FileField';

export const fieldComponents = {
  text: TextField,
  email: TextField,
  tel: TextField,
  url: TextField,
  password: TextField,
  number: NumberField,
  textarea: TextAreaField,
  select: SelectField,
  checkbox: CheckboxField,
  date: DateField,
  datetime: DateField,
  time: DateField,
  file: FileField,
  files: FileField,
} as const;

export type FieldComponentType = keyof typeof fieldComponents;
