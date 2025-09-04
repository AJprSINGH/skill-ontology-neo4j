"use client";

import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, Brain, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJobRoleSkills } from '@/hooks/useApi';

interface MainContentProps {
  selectedEntity: any;
  entityType: 'industry' | 'department' | 'jobrole' | 'skill' | null;
  onViewRelationships: () => void;
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

export function MainContent({ selectedEntity, entityType, onViewRelationships }: MainContentProps) {
  const { data: skills = [] } = useJobRoleSkills(
    entityType === 'jobrole' ? selectedEntity?.id : null
  );

  if (!selectedEntity || !entityType) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <Network className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Skill Ontology Explorer
          </h2>
          <p className="text-gray-600 mb-6">
            Navigate through the hierarchy using the sidebar to explore industries, 
            departments, job roles, and their associated skills.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Industries</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg">
              <Users className="w-6 h-6 text-teal-500 mx-auto mb-2" />
              <p className="font-medium text-teal-900">Departments</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Briefcase className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="font-medium text-amber-900">Job Roles</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-purple-900">Skills</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = entityIcons[entityType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                entityColors[entityType]
              )}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{selectedEntity.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                  </Badge>
                  {selectedEntity.category && (
                    <Badge variant="outline">{selectedEntity.category}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={onViewRelationships} variant="outline">
              <Network className="w-4 h-4 mr-2" />
              View Relationships
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedEntity.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{selectedEntity.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Properties</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-mono">{selectedEntity.id}</span>
                </div>
                {selectedEntity.level && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Level:</span>
                    <span>{selectedEntity.level}</span>
                  </div>
                )}
                {selectedEntity.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(selectedEntity.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {entityType === 'jobrole' && skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Required Skills ({skills.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">{skill.title}</span>
                      {skill.category && (
                        <Badge variant="outline" className="text-xs ml-auto">
                          {skill.category}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}