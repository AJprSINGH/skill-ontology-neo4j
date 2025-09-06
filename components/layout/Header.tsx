"use client";

import { Network as NetworkIcon } from 'lucide-react';
import { SkillSearch } from '@/components/ui/skill-search';
import { SearchResult } from '@/types';

interface HeaderProps {
  onSkillSelect: (skill: SearchResult) => void;
  onSearch?: (query: string) => void;
}

export function Header({ onSkillSelect, onSearch }: HeaderProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <NetworkIcon className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Skill Ontology Explorer</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <SkillSearch onSkillSelect={onSkillSelect} onSearch={onSearch} />
      </div>

      <div className="text-sm text-gray-500">
        Admin Mode
      </div>
    </div>
  );
}