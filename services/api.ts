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
      const response = await this.client.get<ApiResponse<Industry[]>>('/api/industries');
      // If API returns data, use it; otherwise fall back to demo data
      return response.data.data && response.data.data.length > 0 
        ? response.data.data 
        : demoIndustries;
    } catch (error) {
      console.log('API not available, using demo data');
      return demoIndustries;
    }
  }

  async getDepartments(industryId: string): Promise<Department[]> {
    try {
      const response = await this.client.get<ApiResponse<Department[]>>(
        `/api/industry/${industryId}/departments`
      );
      // If API returns data, use it; otherwise fall back to demo data
      return response.data.data && response.data.data.length > 0 
        ? response.data.data 
        : demoDepartments[industryId] || [];
    } catch (error) {
      console.log('API not available, using demo data');
      return demoDepartments[industryId] || [];
    }
  }

  async getJobRoles(departmentId: string): Promise<JobRole[]> {
    try {
      const response = await this.client.get<ApiResponse<JobRole[]>>(
        `/api/department/${departmentId}/jobroles`
      );
      // If API returns data, use it; otherwise fall back to demo data
      return response.data.data && response.data.data.length > 0 
        ? response.data.data 
        : demoJobRoles[departmentId] || [];
    } catch (error) {
      console.log('API not available, using demo data');
      return demoJobRoles[departmentId] || [];
    }
  }

  async getJobRoleSkills(jobroleId: string): Promise<Skill[]> {
    try {
      const response = await this.client.get<ApiResponse<Skill[]>>(
        `/api/jobrole/${jobroleId}/skills`
      );
      // If API returns data, use it; otherwise fall back to demo data
      return response.data.data && response.data.data.length > 0 
        ? response.data.data 
        : demoSkills[jobroleId] || [];
    } catch (error) {
      console.log('API not available, using demo data');
      return demoSkills[jobroleId] || [];
    }
  }

  async searchSkills(query: string): Promise<SearchResult[]> {
    try {
      const response = await this.client.get<ApiResponse<SearchResult[]>>(
        `/api/skills/search?query=${encodeURIComponent(query)}`
      );
      // If API returns data, use it; otherwise filter demo data
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data;
      } else {
        // Filter demo search results based on query
        return demoSearchResults.filter(skill =>
          skill.title.toLowerCase().includes(query.toLowerCase()) ||
          skill.description.toLowerCase().includes(query.toLowerCase())
        );
      }
    } catch (error) {
      console.log('API not available, using demo data');
      // Filter demo search results based on query
      return demoSearchResults.filter(skill =>
        skill.title.toLowerCase().includes(query.toLowerCase()) ||
        skill.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async getSkillPath(fromSkillId: string, toSkillId: string): Promise<SkillPath> {
    try {
      const response = await this.client.get<ApiResponse<SkillPath>>(
        `/api/skills/path?from=${fromSkillId}&to=${toSkillId}`
      );
      // If API returns data, use it; otherwise return demo path
      return response.data.data || demoSkillPath;
    } catch (error) {
      console.log('API not available, using demo data');
      return demoSkillPath;
    }
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
      const response = await this.client.get(`/api/${entityType}/${entityId}/relationships`);
      // If API returns data, use it; otherwise return demo relationships
      return response.data.data || demoRelationships;
    } catch (error) {
      console.log('API not available, using demo data');
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
  getSkillPath: api.getSkillPath.bind(api),
  getEntityRelationships: api.getEntityRelationships.bind(api),
};

export const crudApi = {
  createSkill: api.createSkill.bind(api),
  updateSkill: api.updateSkill.bind(api),
  deleteSkill: api.deleteSkill.bind(api),
  addSkillToJobRole: api.addSkillToJobRole.bind(api),
  addClassificationToSkill: api.addClassificationToSkill.bind(api),
};