"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSkillSearch } from '@/hooks/useApi';
import { SearchResult } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SkillSearchProps {
  onSkillSelect: (skill: SearchResult) => void;
  onSearch?: (query: string) => void;
}

export function SkillSearch({ onSkillSelect, onSearch }: SkillSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading, isFetching, error } = useSkillSearch(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch?.(value);
    setIsOpen(value.length > 0);
  };

  const handleSkillSelect = (skill: SearchResult) => {
    onSkillSelect(skill);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search skills..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {(isLoading || isFetching) && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" text="Searching..." />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 text-sm">
                Search failed. Please try again.
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                  {searchResults.length} skill{searchResults.length !== 1 ? 's' : ''} found
                </div>
                {searchResults.map((skill, index) => (
                  <motion.button
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    onClick={() => handleSkillSelect(skill)}
                    className="w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{skill.title}</p>
                        {skill.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {skill.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {skill.category && (
                            <Badge variant="secondary" className="text-xs">
                              {skill.category}
                            </Badge>
                          )}
                          {skill.relevance_score && (
                            <Badge variant="outline" className="text-xs">
                              {(skill.relevance_score * 100).toFixed(0)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : query.length > 2 ? (
              <div className="py-8 px-4 text-center text-gray-500">
                <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No skills found for "{query}"</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}