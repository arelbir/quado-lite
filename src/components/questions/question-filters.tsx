"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface QuestionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  mandatoryFilter: string;
  onMandatoryFilterChange: (value: string) => void;
}

export function QuestionFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  mandatoryFilter,
  onMandatoryFilterChange,
}: QuestionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Soru metni içinde ara..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Type Filter */}
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tip" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Tipler</SelectItem>
          <SelectItem value="YesNo">Evet/Hayır</SelectItem>
          <SelectItem value="Scale">Ölçek (1-5)</SelectItem>
          <SelectItem value="Text">Serbest Metin</SelectItem>
          <SelectItem value="SingleChoice">Tek Seçim</SelectItem>
          <SelectItem value="Checklist">Çoklu Seçim</SelectItem>
        </SelectContent>
      </Select>

      {/* Mandatory Filter */}
      <Select value={mandatoryFilter} onValueChange={onMandatoryFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Zorunluluk" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          <SelectItem value="mandatory">Zorunlu</SelectItem>
          <SelectItem value="optional">Opsiyonel</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
