'use client';

/**
 * SMART CONDITION EDITOR
 * Textarea with autocomplete suggestions for workflow conditions
 * Supports: core fields, custom fields, operators
 */

import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { ConditionTemplates } from './ConditionTemplates';
import { VisualFormulaBuilder } from './VisualFormulaBuilder';
import { useTranslations } from 'next-intl';

interface ConditionEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  customFieldKeys?: string[];
}

const CORE_FIELDS = [
  { value: 'status', label: 'status', description: 'Current status' },
  { value: 'score', label: 'score', description: 'Numeric score' },
  { value: 'riskLevel', label: 'riskLevel', description: 'Risk level (low/medium/high)' },
  { value: 'priority', label: 'priority', description: 'Priority (low/medium/high)' },
  { value: 'type', label: 'type', description: 'Type/category' },
];

const OPERATORS = [
  { value: '===', label: '===', description: 'Equals (strict)' },
  { value: '!==', label: '!==', description: 'Not equals (strict)' },
  { value: '>', label: '>', description: 'Greater than' },
  { value: '<', label: '<', description: 'Less than' },
  { value: '>=', label: '>=', description: 'Greater or equal' },
  { value: '<=', label: '<=', description: 'Less or equal' },
  { value: 'AND', label: 'AND', description: 'Logical AND' },
  { value: 'OR', label: 'OR', description: 'Logical OR' },
];

const COMMON_VALUES = [
  { value: "'approved'", label: "'approved'", description: 'Status: Approved' },
  { value: "'rejected'", label: "'rejected'", description: 'Status: Rejected' },
  { value: "'high'", label: "'high'", description: 'High priority/risk' },
  { value: "'medium'", label: "'medium'", description: 'Medium priority/risk' },
  { value: "'low'", label: "'low'", description: 'Low priority/risk' },
  { value: 'true', label: 'true', description: 'Boolean true' },
  { value: 'false', label: 'false', description: 'Boolean false' },
  { value: 'undefined', label: 'undefined', description: 'Check if exists' },
];

export function ConditionEditor({
  value,
  onChange,
  label,
  placeholder,
  customFieldKeys = [],
}: ConditionEditorProps) {
  const t = useTranslations('workflow');
  
  // Use translated defaults if not provided
  const finalLabel = label || t('fields.condition');
  const finalPlaceholder = placeholder || t('placeholders.enterCondition');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get current word at cursor
  const getCurrentWord = (text: string, cursorPos: number) => {
    const beforeCursor = text.substring(0, cursorPos);
    const words = beforeCursor.split(/\s+/);
    return words[words.length - 1] || '';
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart || 0;
    const currentWord = getCurrentWord(newValue, cursorPos);

    // Trigger suggestions
    if (currentWord.length > 0) {
      let matches: any[] = [];

      // Check for customFields. prefix
      if (currentWord.startsWith('customFields.')) {
        const fieldPart = currentWord.substring(13); // Remove 'customFields.'
        matches = customFieldKeys
          .filter(key => key.toLowerCase().includes(fieldPart.toLowerCase()))
          .map(key => ({
            value: `customFields.${key}`,
            label: key,
            description: 'Custom field',
            type: 'custom',
          }));
      }
      // Check for just 'custom' typed
      else if ('customFields'.startsWith(currentWord.toLowerCase())) {
        matches = [{
          value: 'customFields.',
          label: 'customFields.',
          description: 'Access custom fields',
          type: 'prefix',
        }];
      }
      // Core fields
      else {
        matches = [
          ...CORE_FIELDS.filter(f => f.value.toLowerCase().includes(currentWord.toLowerCase())),
          ...OPERATORS.filter(o => o.value.toLowerCase().includes(currentWord.toLowerCase())),
          ...COMMON_VALUES.filter(v => v.value.toLowerCase().includes(currentWord.toLowerCase())),
        ];
      }

      if (matches.length > 0) {
        setSuggestions(matches);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Insert suggestion
  const insertSuggestion = (suggestion: any) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart || 0;
    const beforeCursor = value.substring(0, cursorPos);
    const afterCursor = value.substring(cursorPos);
    
    // Find the start of current word
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || '';
    const wordStart = beforeCursor.length - currentWord.length;
    
    // Replace current word with suggestion
    const newValue = value.substring(0, wordStart) + suggestion.value + afterCursor;
    onChange(newValue);
    
    // Move cursor to end of inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = wordStart + suggestion.value.length;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
    
    setShowSuggestions(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      insertSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Quick insert buttons
  const quickInserts = [
    { label: 'customFields.', value: 'customFields.' },
    { label: '===', value: ' === ' },
    { label: 'AND', value: ' AND ' },
    { label: 'OR', value: ' OR ' },
  ];

  const handleQuickInsert = (insert: string) => {
    const newValue = value + insert;
    onChange(newValue);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{finalLabel} *</Label>
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={finalPlaceholder}
          rows={4}
          className="font-mono text-xs"
        />

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Card 
            ref={suggestionsRef}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto p-2 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted ${
                  index === selectedIndex ? 'bg-muted' : ''
                }`}
                onClick={() => insertSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-mono font-medium">{suggestion.label}</div>
                    {suggestion.description && (
                      <div className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                  {suggestion.type === 'custom' && (
                    <Badge variant="secondary" className="text-xs">Custom</Badge>
                  )}
                </div>
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Quick Insert Buttons */}
      <div className="flex flex-wrap gap-1">
        {quickInserts.map((insert) => (
          <Button
            key={insert.value}
            variant="outline"
            size="sm"
            onClick={() => handleQuickInsert(insert.value)}
            className="text-xs h-7"
          >
            <Icons.Plus className="size-3 mr-1" />
            {insert.label}
          </Button>
        ))}
      </div>

      {/* Advanced Tools */}
      <div className="grid grid-cols-2 gap-2">
        <ConditionTemplates onSelect={(condition) => onChange(condition)} />
        <VisualFormulaBuilder onApply={(formula) => onChange(formula)} />
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-xs space-y-1">
        <div className="font-medium">💡 Tips:</div>
        <ul className="space-y-0.5 text-muted-foreground pl-4 list-disc">
          <li>Type to see autocomplete suggestions</li>
          <li>Use ↑↓ arrows to navigate, Enter to select</li>
          <li>Type <code className="bg-background px-1 rounded">customFields.</code> for custom fields</li>
        </ul>
      </div>
    </div>
  );
}
