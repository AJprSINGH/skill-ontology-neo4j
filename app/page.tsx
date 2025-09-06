"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';
import { EntityDrawer } from '@/components/ui/entity-drawer';
import { SkillPathFinder } from '@/components/ui/skill-path-finder';
import { Filters, FilterState } from '@/components/ui/filters';
import { SearchResults } from '@/components/ui/search-results';
import { GraphVisualization } from '@/components/ui/graph-visualization';
import { SearchResult } from '@/types';
import { usePropertyBasedSearch } from '@/hooks/useApi';

export default function Home() {
  // Navigation state
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null);
  
  // UI state
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<'industry' | 'department' | 'jobrole' | 'skill' | null>(null);
  const [isEntityDrawerOpen, setIsEntityDrawerOpen] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    industry: null,
    department: null,
    jobrole: null
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showGraphVisualization, setShowGraphVisualization] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });

  // Search with filters
  const { data: searchResults = [], isLoading: searchLoading } = usePropertyBasedSearch(
    searchQuery, 
    filters
  );
  const handleEntitySelect = (type: 'industry' | 'department' | 'jobrole' | 'skill', entity: any) => {
    setSelectedEntity(entity);
    setSelectedEntityType(type);
    setIsEntityDrawerOpen(true);
  };

  const handleSkillSelect = (skill: SearchResult) => {
    setSearchQuery(skill.title);
    setShowSearchResults(true);
    handleEntitySelect('skill', skill);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleViewDetails = (result: SearchResult) => {
    handleEntitySelect('skill', result);
  };

  const handleVisualizeGraph = (result: SearchResult) => {
    // Generate demo graph data for the selected entity
    const nodes = [
      { id: result.id, label: result.title, type: 'skill', color: '#8B5CF6' },
      { id: 'related-1', label: 'Related Skill 1', type: 'skill', color: '#8B5CF6' },
      { id: 'related-2', label: 'Related Skill 2', type: 'skill', color: '#8B5CF6' },
      { id: 'jobrole-1', label: 'Frontend Developer', type: 'jobrole', color: '#F59E0B' },
      { id: 'department-1', label: 'Engineering', type: 'department', color: '#14B8A6' }
    ];
    
    const edges = [
      { id: 'e1', source: 'jobrole-1', target: result.id, label: 'requires' },
      { id: 'e2', source: result.id, target: 'related-1', label: 'relates to' },
      { id: 'e3', source: result.id, target: 'related-2', label: 'relates to' },
      { id: 'e4', source: 'department-1', target: 'jobrole-1', label: 'contains' }
    ];
    
    setGraphData({ nodes, edges });
    setShowGraphVisualization(true);
  };
  const handleViewRelationships = () => {
    if (selectedEntity) {
      handleVisualizeGraph(selectedEntity);
    }
    setIsEntityDrawerOpen(true);
  };

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    setSelectedDepartment(null);
    setSelectedJobRole(null);
    setFilters(prev => ({ ...prev, industry: industryId, department: null, jobrole: null }));
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedJobRole(null);
    setFilters(prev => ({ ...prev, department: departmentId, jobrole: null }));
  };

  const handleJobRoleSelectLocal = (jobroleId: string) => {
    setSelectedJobRole(jobroleId);
    setFilters(prev => ({ ...prev, jobrole: jobroleId }));
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
        onJobRoleSelect={handleJobRoleSelectLocal}
        onEntitySelect={handleEntitySelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Header onSkillSelect={handleSkillSelect} onSearch={handleSearch} />
        
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="grid lg:grid-cols-3 gap-6 p-6">
            <div className="lg:col-span-2">
              {showGraphVisualization ? (
                <GraphVisualization
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  onNodeClick={(node) => console.log('Node clicked:', node)}
                  onNodeExpand={(nodeId) => console.log('Node expand:', nodeId)}
                  height={600}
                />
              ) : showSearchResults ? (
                <div className="space-y-6">
                  <Filters
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                  <SearchResults
                    results={searchResults}
                    isLoading={searchLoading}
                    onViewDetails={handleViewDetails}
                    onVisualizeGraph={handleVisualizeGraph}
                  />
                </div>
              ) : (
                <MainContent
                  selectedEntity={selectedEntity}
                  entityType={selectedEntityType}
                  onViewRelationships={handleViewRelationships}
                />
              )}
            </div>
            
            <div className="space-y-6">
              <SkillPathFinder />
              
              {(showSearchResults || showGraphVisualization) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSearchResults(false);
                      setShowGraphVisualization(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Back to Main
                  </button>
                  {showSearchResults && (
                    <button
                      onClick={() => setShowGraphVisualization(!showGraphVisualization)}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      {showGraphVisualization ? 'Show Results' : 'Show Graph'}
                    </button>
                  )}
                </div>
              )}
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