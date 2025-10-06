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
import { usePropertyBasedSearch, useShortestPath } from '@/hooks/useApi';
import { queryApi } from '@/services/api';

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

  // Pathfinding state
  const [pathfindingSource, setPathfindingSource] = useState<string | null>(null);
  const [pathfindingTarget, setPathfindingTarget] = useState<string | null>(null);

  // Search with filters
  const { data: searchResults = [], isLoading: searchLoading } = usePropertyBasedSearch(
    searchQuery,
    filters
  );

  // Shortest path query
  const { data: shortestPath, isLoading: pathLoading } = useShortestPath(
    pathfindingSource,
    pathfindingTarget,
    'skill'
  );

  const handleEntitySelect = async (type: 'industry' | 'department' | 'jobrole' | 'skill', entity: any) => {
    setSelectedEntity(entity);
    setSelectedEntityType(type);
    setIsEntityDrawerOpen(true);

    // Automatically visualize relationships when an entity is selected
    try {
      let relationships;

      if (type === 'jobrole') {
        relationships = await queryApi.getEntityRelationshipsNew(type, {
          id: entity.id,
          jobrole: entity.title || entity.jobrole || entity.name || '',
        });
      } else {
        relationships = await queryApi.getEntityRelationships(type, entity.id);
      }


      // Transform the relationships data to graph format
      const nodes = [
        {
          id: relationships.entity.id,
          label: relationships.entity.title,
          type: relationships.entity.type,
          color: getNodeColor(relationships.entity.type)
        },
        ...relationships.connected_entities.map((connectedEntity: any) => ({
          id: connectedEntity.id,
          label: connectedEntity.title,
          type: connectedEntity.type,
          color: getNodeColor(connectedEntity.type)
        }))
      ];

      const edges = relationships.relationships.map((rel: any) => ({
        id: `${rel.from_id}-${rel.to_id}`,
        source: rel.from_id,
        target: rel.to_id,
        label: rel.type
      }));

      setGraphData({ nodes, edges });
      setShowGraphVisualization(true);
    } catch (error) {
      console.error('Error visualizing entity relationships:', error);
      // Fallback to simple visualization
      const nodes = [
        { id: entity.id, label: entity.title, type: type, color: getNodeColor(type) }
      ];

      const edges: any[] = [];

      setGraphData({ nodes, edges });
      setShowGraphVisualization(true);
    }
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

  const handleVisualizeGraph = async (result: SearchResult) => {
    try {
      // Use the API to get actual relationships for the entity
      // Use the API to get actual relationships for the entity
      const relationships = await fetch(`/api/entities/skill/${result.id}/relationships`)
        .then(res => res.json())
        .catch(() => ({ entity: result, connected_entities: [], relationships: [] }));

      // Transform the relationships data to graph format
      const nodes = [
        {
          id: relationships.entity.id,
          label: relationships.entity.title,
          type: relationships.entity.type,
          color: '#8B5CF6'
        },
        ...relationships.connected_entities.map((entity: any) => ({
          id: entity.id,
          label: entity.title,
          type: entity.type,
          color: getNodeColor(entity.type)
        }))
      ];

      const edges = relationships.relationships.map((rel: any) => ({
        id: `${rel.from_id}-${rel.to_id}`,
        source: rel.from_id,
        target: rel.to_id,
        label: rel.type
      }));

      setGraphData({ nodes, edges });
      setShowGraphVisualization(true);
    } catch (error) {
      console.error('Error visualizing graph:', error);
      // Fallback to demo data if API fails
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
    }
  };

  const getNodeColor = (type: string) => {
    const colors = {
      industry: '#3B82F6',
      department: '#14B8A6',
      jobrole: '#F59E0B',
      skill: '#8B5CF6',
      classification: '#EF4444',
      cwf: '#06B6D4'
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const handlePathFind = (sourceId: string, targetId: string) => {
    console.log(`🔍 Finding shortest path from ${sourceId} to ${targetId}`);
    setPathfindingSource(sourceId);
    setPathfindingTarget(targetId);

    // When path is found, visualize it in the graph
    if (shortestPath && shortestPath.path.length > 0) {
      const pathNodes = shortestPath.path.map((node, index) => ({
        id: node.id,
        label: node.title,
        type: node.type,
        color: index === 0 ? '#10B981' : index === shortestPath.path.length - 1 ? '#EF4444' : '#8B5CF6'
      }));

      const pathEdges = shortestPath.path.slice(0, -1).map((node, index) => ({
        id: `path-${index}`,
        source: node.id,
        target: shortestPath.path[index + 1].id,
        label: 'path'
      }));

      setGraphData({ nodes: pathNodes, edges: pathEdges });
      setShowGraphVisualization(true);
    }
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
                  onPathFind={handlePathFind}
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