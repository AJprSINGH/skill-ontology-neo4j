"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';
import { EntityDrawer } from '@/components/ui/entity-drawer';
import { SkillPathFinder } from '@/components/ui/skill-path-finder';
import { SearchResult } from '@/types';

export default function Home() {
  // Navigation state
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null);
  
  // UI state
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<'industry' | 'department' | 'jobrole' | 'skill' | null>(null);
  const [isEntityDrawerOpen, setIsEntityDrawerOpen] = useState(false);

  const handleEntitySelect = (type: 'industry' | 'department' | 'jobrole' | 'skill', entity: any) => {
    setSelectedEntity(entity);
    setSelectedEntityType(type);
    setIsEntityDrawerOpen(true);
  };

  const handleSkillSelect = (skill: SearchResult) => {
    handleEntitySelect('skill', skill);
  };

  const handleViewRelationships = () => {
    setIsEntityDrawerOpen(true);
  };

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    setSelectedDepartment(null);
    setSelectedJobRole(null);
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedJobRole(null);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar
        selectedIndustry={selectedIndustry}
        selectedDepartment={selectedDepartment}
        selectedJobRole={selectedJobRole}
        onIndustrySelect={handleIndustrySelect}
        onDepartmentSelect={handleDepartmentSelect}
        onJobRoleSelect={setSelectedJobRole}
        onEntitySelect={handleEntitySelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Header onSkillSelect={handleSkillSelect} />
        
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="grid lg:grid-cols-3 gap-6 p-6">
            <div className="lg:col-span-2">
              <MainContent
                selectedEntity={selectedEntity}
                entityType={selectedEntityType}
                onViewRelationships={handleViewRelationships}
              />
            </div>
            
            <div className="space-y-6">
              <SkillPathFinder />
            </div>
          </div>
        </div>
      </div>

      {/* Entity Details Drawer */}
      <EntityDrawer
        isOpen={isEntityDrawerOpen}
        onClose={() => setIsEntityDrawerOpen(false)}
        entity={selectedEntity}
        entityType={selectedEntityType || 'skill'}
      />
    </div>
  );
}