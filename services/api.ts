import axios, { AxiosInstance } from 'axios';
import {
  demoIndustries,
  demoDepartments,
  demoJobRoles,
  demoSkills,
  demoSearchResults,
  demoSkillPath,
  demoRelationships
} from './demoData';
import {
  Industry,
  Department,
  JobRole,
  Skill,
  Classification,
  CriticalWorkFunction,
  AuthResponse,
  ApiResponse,
  SearchResult,
  SkillPath
} from '@/types';

// Logging utility for graph traversal queries
const logGraphQuery = (operation: string, params: any, result?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    params,
    result: result ? { count: Array.isArray(result) ? result.length : 1 } : undefined
  };
  console.log('🔍 Graph Query:', logEntry);

  // Store in localStorage for debugging (optional)
  try {
    const logs = JSON.parse(localStorage.getItem('graphQueryLogs') || '[]');
    logs.push(logEntry);
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    localStorage.setItem('graphQueryLogs', JSON.stringify(logs));
  } catch (error) {
    // Ignore localStorage errors
  }
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://dev.triz.co.in',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Demo mode - no authentication required
  }

  // Query endpoints
  async getIndustries(): Promise<Industry[]> {
    try {
      logGraphQuery('getIndustries', {});
      const response = await this.client.get<ApiResponse<Industry[]>>('/api/industries');
      // If API returns data, use it; otherwise fall back to demo data
      const result = response.data.data && response.data.data.length > 0
        ? response.data.data
        : demoIndustries;
      logGraphQuery('getIndustries', {}, result);
      return result;
    } catch (error) {
      console.log('API not available, using demo data');
      logGraphQuery('getIndustries', {}, demoIndustries);
      return demoIndustries;
    }
  }

  async getDepartments(industryId: string): Promise<Department[]> {
    try {
      logGraphQuery('getDepartments', { industryId });
      const response = await this.client.get<ApiResponse<Department[]>>(
        `/api/industry/${industryId}/departments`
      );
      // If API returns data, use it; otherwise fall back to demo data
      const result = response.data.data && response.data.data.length > 0
        ? response.data.data
        : demoDepartments[industryId] || [];
      logGraphQuery('getDepartments', { industryId }, result);
      return result;
    } catch (error) {
      console.log('API not available, using demo data');
      const result = demoDepartments[industryId] || [];
      logGraphQuery('getDepartments', { industryId }, result);
      return demoDepartments[industryId] || [];
    }
  }

  async getJobRoles(departmentId: string): Promise<JobRole[]> {
    try {
      logGraphQuery('getJobRoles', { departmentId });
      const response = await this.client.get<ApiResponse<JobRole[]>>(
        `/api/department/${departmentId}/jobroles`
      );
      // If API returns data, use it; otherwise fall back to demo data
      const result = response.data.data && response.data.data.length > 0
        ? response.data.data
        : demoJobRoles[departmentId] || [];
      logGraphQuery('getJobRoles', { departmentId }, result);
      return result;
    } catch (error) {
      console.log('API not available, using demo data');
      const result = demoJobRoles[departmentId] || [];
      logGraphQuery('getJobRoles', { departmentId }, result);
      return demoJobRoles[departmentId] || [];
    }
  }

  async getJobRoleSkills(jobroleId: string): Promise<Skill[]> {
    try {
      logGraphQuery('getJobRoleSkills', { jobroleId });
      const response = await this.client.get<ApiResponse<Skill[]>>(
        `/api/jobrole/${jobroleId}/skills`
      );
      // If API returns data, use it; otherwise fall back to demo data
      const result = response.data.data && response.data.data.length > 0
        ? response.data.data
        : demoSkills[jobroleId] || [];
      logGraphQuery('getJobRoleSkills', { jobroleId }, result);
      return result;
    } catch (error) {
      console.log('API not available, using demo data');
      const result = demoSkills[jobroleId] || [];
      logGraphQuery('getJobRoleSkills', { jobroleId }, result);
      return demoSkills[jobroleId] || [];
    }
  }

  async searchSkills(query: string): Promise<SearchResult[]> {
    try {
      logGraphQuery('searchSkills', { query });
      const response = await this.client.get<ApiResponse<SearchResult[]>>(
        `/api/skills/search?query=${encodeURIComponent(query)}`
      );
      // If API returns data, use it; otherwise filter demo data
      if (response.data.data && response.data.data.length > 0) {
        logGraphQuery('searchSkills', { query }, response.data.data);
        return response.data.data;
      } else {
        // Filter demo search results based on query
        const result = demoSearchResults.filter(skill =>
          skill.title.toLowerCase().includes(query.toLowerCase()) ||
          skill.description.toLowerCase().includes(query.toLowerCase())
        );
        logGraphQuery('searchSkills', { query }, result);
        return result;
      }
    } catch (error) {
      console.log('API not available, using demo data');
      // Filter demo search results based on query
      const result = demoSearchResults.filter(skill =>
        skill.title.toLowerCase().includes(query.toLowerCase()) ||
        skill.description.toLowerCase().includes(query.toLowerCase())
      );
      logGraphQuery('searchSkills', { query }, result);
      return result;
    }
  }

  async propertyBasedSearch(query: string, filters: any): Promise<SearchResult[]> {
    try {
      logGraphQuery('propertyBasedSearch', { query, filters });
      const params = new URLSearchParams();
      params.append('query', query);
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.department) params.append('department', filters.department);
      if (filters.jobrole) params.append('jobrole', filters.jobrole);

      const response = await this.client.get<ApiResponse<SearchResult[]>>(
        `/api/search?${params.toString()}`
      );

      // If API returns data, use it; otherwise filter demo data
      if (response.data.data && response.data.data.length > 0) {
        logGraphQuery('propertyBasedSearch', { query, filters }, response.data.data);
        return response.data.data;
      } else {
        // Filter demo search results based on query and filters
        const result = this.filterDemoResults(query, filters);
        logGraphQuery('propertyBasedSearch', { query, filters }, result);
        return result;
      }
    } catch (error) {
      console.log('API not available, using demo data');
      const result = this.filterDemoResults(query, filters);
      logGraphQuery('propertyBasedSearch', { query, filters }, result);
      return result;
    }
  }

  private filterDemoResults(query: string, filters: any): SearchResult[] {
    let results = [...demoSearchResults];

    // Filter by query
    if (query) {
      results = results.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply filters (simplified for demo)
    if (filters.industry || filters.department || filters.jobrole) {
      // In a real implementation, this would filter based on actual relationships
      // For demo, we'll just return filtered results
      results = results.slice(0, Math.max(1, results.length - 2));
    }

    return results;
  }

  async getSkillPath(fromSkillId: string, toSkillId: string): Promise<SkillPath> {
    try {
      logGraphQuery('getSkillPath', { fromSkillId, toSkillId });
      const response = await this.client.get<ApiResponse<SkillPath>>(
        `/api/skills/path?from=${fromSkillId}&to=${toSkillId}`
      );
      // If API returns data, use it; otherwise return demo path
      const result = response.data.data || demoSkillPath;
      logGraphQuery('getSkillPath', { fromSkillId, toSkillId }, result);
      return result;
    } catch (error) {
      console.log('API not available, using demo data');
      logGraphQuery('getSkillPath', { fromSkillId, toSkillId }, demoSkillPath);
      return demoSkillPath;
    }
  }

  // New shortest path API
  async getShortestPath(sourceId: string, targetId: string, entityType: 'skill' | 'jobrole' = 'skill'): Promise<SkillPath> {
    try {
      logGraphQuery('getShortestPath', { sourceId, targetId, entityType });
      const response = await this.client.get<ApiResponse<SkillPath>>(
        `/api/graph/shortest-path?source=${sourceId}&target=${targetId}&type=${entityType}`
      );

      if (response.data.data) {
        logGraphQuery('getShortestPath', { sourceId, targetId, entityType }, response.data.data);
        return response.data.data;
      } else {
        // Generate demo shortest path
        const demoPath = this.generateDemoShortestPath(sourceId, targetId, entityType);
        logGraphQuery('getShortestPath', { sourceId, targetId, entityType }, demoPath);
        return demoPath;
      }
    } catch (error) {
      console.log('API not available, using demo data');
      const demoPath = this.generateDemoShortestPath(sourceId, targetId, entityType);
      logGraphQuery('getShortestPath', { sourceId, targetId, entityType }, demoPath);
      return demoPath;
    }
  }

  private generateDemoShortestPath(sourceId: string, targetId: string, entityType: string): SkillPath {
    // Generate a realistic demo path based on the source and target
    const allNodes = [
      ...Object.values(demoSkills).flat(),
      ...Object.values(demoJobRoles).flat()
    ];

    const sourceNode = allNodes.find(node => node.id === sourceId);
    const targetNode = allNodes.find(node => node.id === targetId);

    if (!sourceNode || !targetNode) {
      return { path: [], distance: 0 };
    }

    // Create a simple path with intermediate nodes
    const path = [
      { id: sourceId, title: sourceNode.title, type: entityType },
      { id: 'intermediate-1', title: 'Intermediate Skill', type: 'skill' },
      { id: targetId, title: targetNode.title, type: entityType }
    ];

    return {
      path,
      distance: path.length - 1
    };
  }

  // CRUD endpoints
  async createSkill(skill: Partial<Skill>): Promise<Skill> {
    const response = await this.client.post<ApiResponse<Skill>>('/api/skills', skill);
    return response.data.data;
  }

  async updateSkill(skillId: string, skill: Partial<Skill>): Promise<Skill> {
    const response = await this.client.put<ApiResponse<Skill>>(`/api/skills/${skillId}`, skill);
    return response.data.data;
  }

  async deleteSkill(skillId: string): Promise<void> {
    await this.client.delete(`/api/skills/${skillId}`);
  }

  async addSkillToJobRole(jobroleId: string, skillId: string): Promise<void> {
    await this.client.post(`/api/jobrole/${jobroleId}/skills`, { skill_id: skillId });
  }

  async addClassificationToSkill(skillId: string, classificationId: string): Promise<void> {
    await this.client.post(`/api/skill/${skillId}/classification`, {
      classification_id: classificationId,
    });
  }

  // Get entity relationships
  async getEntityRelationships(entityType: string, entityId: string): Promise<any> {
    try {
      logGraphQuery('getEntityRelationships', { entityType, entityId });
      const response = await this.client.get(`/api/${entityType}/${entityId}/relationships`);
      // If API returns data, use it; otherwise return demo relationships
      const result = response.data.data || demoRelationships;
      logGraphQuery('getEntityRelationships', { entityType, entityId }, result);
      return result;
    } catch (error) {
      console.log('API not available, using demo data');
      logGraphQuery('getEntityRelationships', { entityType, entityId }, demoRelationships);
      return demoRelationships;
    }
  }
}

export const api = new ApiClient();

export const queryApi = {
  getIndustries: api.getIndustries.bind(api),
  getDepartments: api.getDepartments.bind(api),
  getJobRoles: api.getJobRoles.bind(api),
  getJobRoleSkills: api.getJobRoleSkills.bind(api),
  searchSkills: api.searchSkills.bind(api),
  propertyBasedSearch: api.propertyBasedSearch.bind(api),
  getSkillPath: api.getSkillPath.bind(api),
  getEntityRelationships: api.getEntityRelationships.bind(api),
  getShortestPath: api.getShortestPath.bind(api),
};

export const crudApi = {
  createSkill: api.createSkill.bind(api),
  updateSkill: api.updateSkill.bind(api),
  deleteSkill: api.deleteSkill.bind(api),
  addSkillToJobRole: api.addSkillToJobRole.bind(api),
  addClassificationToSkill: api.addClassificationToSkill.bind(api),
};