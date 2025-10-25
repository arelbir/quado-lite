"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  allowNone?: boolean;
  noneLabel?: string;
}

/**
 * SEARCHABLE SELECT COMPONENT
 * 
 * Reusable searchable select with command palette pattern
 * 
 * Features:
 * - Search/filter functionality
 * - Keyboard navigation
 * - Optional "None" value
 * - Form compatible
 * - Fully accessible
 * 
 * DRY: Single source of truth for all select fields
 * SOLID: Single responsibility, open for extension
 * 
 * @example
 * ```tsx
 * <SearchableSelect
 *   options={companies.map(c => ({ value: c.id, label: c.name }))}
 *   value={field.value}
 *   onValueChange={field.onChange}
 *   placeholder="Select company"
 *   allowNone
 * />
 * ```
 */
export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  emptyText = "No results found.",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  allowNone = false,
  noneLabel = "None",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Build options list
  const allOptions = React.useMemo(() => {
    const opts = [...options];
    if (allowNone) {
      opts.unshift({ value: "none", label: noneLabel });
    }
    return opts;
  }, [options, allowNone, noneLabel]);

  // Get selected label
  const selectedLabel = React.useMemo(() => {
    const selected = allOptions.find((opt) => opt.value === value);
    return selected?.label || placeholder;
  }, [value, allOptions, placeholder]);

  // Handle select
  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue === value ? "" : selectedValue);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {allOptions
                .filter((option) =>
                  option.label.toLowerCase().includes(search.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
