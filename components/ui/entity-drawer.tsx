"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  X,
  Calendar,
  Tag,
  FileText,
  Hash,
  Network,
  Building2,
  Users,
  Briefcase,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RelationshipGraph } from './relationship-graph';
import { useEntityRelationships } from '@/hooks/useApi';

interface EntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  entityType: 'industry' | 'department' | 'jobrole' | 'skill';
}

const entityIcons = {
  industry: Building2,
  department: Users,
  jobrole: Briefcase,
  skill: Brain,
};

const entityColors = {
  industry: 'bg-blue-100 text-blue-800',
  department: 'bg-teal-100 text-teal-800',
  jobrole: 'bg-amber-100 text-amber-800',
  skill: 'bg-purple-100 text-purple-800',
};

export function EntityDrawer({ isOpen, onClose, entity, entityType }: EntityDrawerProps) {
  const [showRelationships, setShowRelationships] = useState(false);

  const { data: relationships = [], isLoading: relationshipsLoading } = useEntityRelationships(
    entityType,
    entity?.id
  );

  const IconComponent = entityIcons[entityType];

  if (!entity) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-2/3 max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    entityColors[entityType]
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{entity.title}</h2>
                    <Badge variant="secondary" className="mt-1">
                      {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="details" className="h-full flex flex-col">
                <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-gray-50 p-0">
                  <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="relationships" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                    Relationships
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="details" className="p-6 space-y-6 mt-0">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 font-medium">ID</p>
                          <p className="text-gray-900 font-mono text-sm">{entity.id}</p>
                        </div>
                      </div>

                      {entity.description && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Description</p>
                            <p className="text-gray-900 leading-relaxed">{entity.description}</p>
                          </div>
                        </div>
                      )}

                      {entity.category && (
                        <div className="flex items-start gap-3">
                          <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Category</p>
                            <Badge variant="outline">{entity.category}</Badge>
                          </div>
                        </div>
                      )}

                      {entity.level && (
                        <div className="flex items-start gap-3">
                          <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Level</p>
                            <Badge variant="outline">{entity.level}</Badge>
                          </div>
                        </div>
                      )}

                      {entity.created_at && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Created</p>
                            <p className="text-gray-900">
                              {new Date(entity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => setShowRelationships(true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Network className="w-4 h-4 mr-2" />
                        View Relationships
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="relationships" className="p-6 mt-0">
                    <div className="h-96">
                      <RelationshipGraph
                        entityType={entityType}
                        entityId={entity.id}
                        relationships={relationships}
                        isLoading={relationshipsLoading}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}