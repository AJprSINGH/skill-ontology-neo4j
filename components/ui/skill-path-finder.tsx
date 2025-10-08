"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, Brain, ArrowRight, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSkillSearch, useSkillPath, useShortestPath } from '@/hooks/useApi';
import { SearchResult, PathNode } from '@/types';

const RESULTS_PER_PAGE = 3;

interface SkillPathFinderProps {
  onPathFind?: (sourceId: string, targetId: string) => void;
}

export function SkillPathFinder({ onPathFind }: SkillPathFinderProps) {
  const [fromSkill, setFromSkill] = useState<SearchResult | null>(null);
  const [toSkill, setToSkill] = useState<SearchResult | null>(null);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [showFromResults, setShowFromResults] = useState(false);
  const [showToResults, setShowToResults] = useState(false);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);

  const { data: fromResults = [] } = useSkillSearch(fromQuery);
  const { data: toResults = [] } = useSkillSearch(toQuery);

  const { data: pathData, isLoading: pathLoading, error } = useShortestPath(
    fromSkill?.id || null,
    toSkill?.id || null,
    'skill'
  );

  // Call onPathFind when path data becomes available
  useEffect(() => {
    if (pathData && pathData.path && pathData.path.length > 0 && onPathFind) {
      onPathFind(fromSkill?.id || '', toSkill?.id || '');
    }
  }, [pathData, fromSkill?.id, toSkill?.id, onPathFind]);

  // Pagination for search results
  const paginatedFromResults = fromResults.slice(
    (fromPage - 1) * RESULTS_PER_PAGE,
    fromPage * RESULTS_PER_PAGE
  );
  const paginatedToResults = toResults.slice(
    (toPage - 1) * RESULTS_PER_PAGE,
    toPage * RESULTS_PER_PAGE
  );

  const fromTotalPages = Math.ceil(fromResults.length / RESULTS_PER_PAGE);
  const toTotalPages = Math.ceil(toResults.length / RESULTS_PER_PAGE);

  const handleFromSkillSelect = (skill: SearchResult) => {
    setFromSkill(skill);
    setFromQuery(skill.title);
    setShowFromResults(false);
    setFromPage(1);
  };

  const handleToSkillSelect = (skill: SearchResult) => {
    setToSkill(skill);
    setToQuery(skill.title);
    setShowToResults(false);
    setToPage(1);
  };

  const resetSearch = () => {
    setFromSkill(null);
    setToSkill(null);
    setFromQuery('');
    setToQuery('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="w-5 h-5 text-blue-500" />
          Shortest Path Finder
        </CardTitle>
        <CardDescription>
          Find the shortest learning path between two skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skill Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* From Skill */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Skill</label>
            <div className="relative">
              <Input
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setShowFromResults(e.target.value.length > 2);
                  setFromPage(1);
                  if (!e.target.value) setFromSkill(null);
                }}
                placeholder="Start typing skill name..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

              {showFromResults && fromResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {paginatedFromResults.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleFromSkillSelect(skill)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{skill.title}</div>
                      {skill.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {skill.category}
                        </Badge>
                      )}
                    </button>
                  ))}
                  {fromTotalPages > 1 && (
                    <div className="flex items-center justify-between p-2 border-t bg-gray-50">
                      <Button
                        onClick={() => setFromPage(prev => Math.max(1, prev - 1))}
                        disabled={fromPage === 1}
                        variant="ghost"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-gray-500">
                        {fromPage} of {fromTotalPages}
                      </span>
                      <Button
                        onClick={() => setFromPage(prev => Math.min(fromTotalPages, prev + 1))}
                        disabled={fromPage === fromTotalPages}
                        variant="ghost"
                        size="sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {fromSkill && (
              <div className="p-2 bg-blue-50 rounded-md border">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">{fromSkill.title}</span>
                </div>
              </div>
            )}
          </div>

          {/* To Skill */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To Skill</label>
            <div className="relative">
              <Input
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  setShowToResults(e.target.value.length > 2);
                  setToPage(1);
                  if (!e.target.value) setToSkill(null);
                }}
                placeholder="Start typing skill name..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

              {showToResults && toResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {paginatedToResults.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleToSkillSelect(skill)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{skill.title}</div>
                      {skill.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {skill.category}
                        </Badge>
                      )}
                    </button>
                  ))}
                  {toTotalPages > 1 && (
                    <div className="flex items-center justify-between p-2 border-t bg-gray-50">
                      <Button
                        onClick={() => setToPage(prev => Math.max(1, prev - 1))}
                        disabled={toPage === 1}
                        variant="ghost"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-gray-500">
                        {toPage} of {toTotalPages}
                      </span>
                      <Button
                        onClick={() => setToPage(prev => Math.min(toTotalPages, prev + 1))}
                        disabled={toPage === toTotalPages}
                        variant="ghost"
                        size="sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {toSkill && (
              <div className="p-2 bg-green-50 rounded-md border">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">{toSkill.title}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={resetSearch}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
        </div>

        {/* Results */}
        {pathLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Finding shortest path...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">Unable to find a path between these skills.</p>
          </div>
        )}

        {pathData && pathData.path && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Learning Path Found</h3>
              <Badge variant="outline">
                {pathData.path.length} steps • Distance: {pathData.distance}
              </Badge>
            </div>

            <div className="space-y-3">
              {pathData.path.map((node: PathNode, index: number) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{node.title}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {node.type}
                    </Badge>
                  </div>
                  {index < pathData.path.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}