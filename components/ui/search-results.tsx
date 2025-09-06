"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Brain, 
  Eye, 
  Network, 
  Grid3X3, 
  List,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { SearchResult } from '@/types';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onViewDetails: (result: SearchResult) => void;
  onVisualizeGraph: (result: SearchResult) => void;
  className?: string;
}

const entityIcons = {
  industry: Building2,
  department: Users,
  jobrole: Briefcase,
  skill: Brain,
};

const entityColors = {
  industry: 'bg-blue-100 text-blue-800 border-blue-200',
  department: 'bg-teal-100 text-teal-800 border-teal-200',
  jobrole: 'bg-amber-100 text-amber-800 border-amber-200',
  skill: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function SearchResults({ 
  results, 
  isLoading, 
  onViewDetails, 
  onVisualizeGraph,
  className 
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  const ResultCard = ({ result, index }: { result: SearchResult; index: number }) => {
    const entityType = result.category?.toLowerCase() || 'skill';
    const IconComponent = entityIcons[entityType as keyof typeof entityIcons] || Brain;
    const colorClass = entityColors[entityType as keyof typeof entityColors] || entityColors.skill;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-1">{result.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                    </Badge>
                    {result.relevance_score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-500">
                          {Math.round(result.relevance_score * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="line-clamp-2 mb-4">
              {result.description}
            </CardDescription>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(result)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVisualizeGraph(result)}
              >
                <Network className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const ListItem = ({ result, index }: { result: SearchResult; index: number }) => {
    const entityType = result.category?.toLowerCase() || 'skill';
    const IconComponent = entityIcons[entityType as keyof typeof entityIcons] || Brain;
    const colorClass = entityColors[entityType as keyof typeof entityColors] || entityColors.skill;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{result.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                  </Badge>
                  {result.relevance_score && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">
                        {Math.round(result.relevance_score * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 line-clamp-1">{result.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(result)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVisualizeGraph(result)}
                >
                  <Network className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            Search Results ({results.length})
          </h2>
        </div>
        <div className="flex gap-1">
          <Toggle
            pressed={viewMode === 'grid'}
            onPressedChange={() => setViewMode('grid')}
            size="sm"
          >
            <Grid3X3 className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === 'list'}
            onPressedChange={() => setViewMode('list')}
            size="sm"
          >
            <List className="w-4 h-4" />
          </Toggle>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result, index) => (
            <ResultCard key={result.id} result={result} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => (
            <ListItem key={result.id} result={result} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}