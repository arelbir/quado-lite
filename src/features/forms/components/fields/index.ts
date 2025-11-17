/**
 * FIELD COMPONENTS INDEX
 * Export all field components
 */

export { TextField } from './TextField';
export { TextAreaField } from './TextAreaField';
export { NumberField } from './NumberField';
export { SelectField } from './SelectField';
export { CheckboxField } from './CheckboxField';
export { CheckboxesField } from './CheckboxesField';
export { RadioField } from './RadioField';
export { DateField } from './DateField';
export { FileField } from './FileField';
export { SignatureField } from './SignatureField';
export { RatingField } from './RatingField';
export { DataGridField } from './DataGridField';
export { RichTextField } from './RichTextField';

// Field component map for dynamic rendering
import { TextField } from './TextField';
import { TextAreaField } from './TextAreaField';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { CheckboxesField } from './CheckboxesField';
import { RadioField } from './RadioField';
import { DateField } from './DateField';
import { FileField } from './FileField';
import { SignatureField } from './SignatureField';
import { RatingField } from './RatingField';
import { DataGridField } from './DataGridField';
import { RichTextField } from './RichTextField';

export const fieldComponents = {
  text: TextField,
  email: TextField,
  tel: TextField,
  url: TextField,
  password: TextField,
  number: NumberField,
  textarea: TextAreaField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  checkboxes: CheckboxesField,
  date: DateField,
  datetime: DateField,
  time: DateField,
  file: FileField,
  files: FileField,
  signature: SignatureField,
  rating: RatingField,
  datagrid: DataGridField,
  richtext: RichTextField,
} as const;

export type FieldComponentType = keyof typeof fieldComponents;
