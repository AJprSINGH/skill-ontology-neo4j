import axios, { AxiosInstance, AxiosError } from 'axios';
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

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://hp.triz.co.in/api',
  TOKEN: '1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5',
  SUB_INSTITUTE_ID: '3',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Error Types
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  originalError?: any;
  retryable: boolean;
}

// Logging utility for graph traversal queries
const logGraphQuery = (operation: string, params: any, result?: any, error?: ApiError) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    params,
    result: result ? {
      count: Array.isArray(result) ? result.length : 1,
      success: true
    } : undefined,
    error: error ? {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      retryable: error.retryable
    } : undefined
  };

  console.log('🔍 Graph Query:', logEntry);

  // Store in localStorage for debugging
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

// Response validation utilities
const validateResponse = (data: any, expectedFields: string[] = []): boolean => {
  if (!data) return false;

  // Check if it's an array and has items
  if (Array.isArray(data)) {
    if (data.length === 0) return true; // Empty arrays are valid
    // Validate first item has expected fields
    const firstItem = data[0];
    return expectedFields.every(field => firstItem.hasOwnProperty(field));
  }

  // Check if object has expected fields
  return expectedFields.every(field => data.hasOwnProperty(field));
};

// Error classification utility
const classifyError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return {
        type: ApiErrorType.TIMEOUT_ERROR,
        message: 'Request timed out. Please try again.',
        statusCode: 408,
        originalError: error,
        retryable: true
      };
    }

    if (!axiosError.response) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection.',
        originalError: error,
        retryable: true
      };
    }

    const status = axiosError.response.status;

    switch (status) {
      case 401:
      case 403:
        return {
          type: ApiErrorType.AUTHENTICATION_ERROR,
          message: 'Authentication failed. Please check your credentials.',
          statusCode: status,
          originalError: error,
          retryable: false
        };
      case 404:
        return {
          type: ApiErrorType.NOT_FOUND_ERROR,
          message: 'Resource not found.',
          statusCode: status,
          originalError: error,
          retryable: false
        };
      case 422:
        return {
          type: ApiErrorType.VALIDATION_ERROR,
          message: 'Invalid data provided.',
          statusCode: status,
          originalError: error,
          retryable: false
        };
      case 429:
        return {
          type: ApiErrorType.RATE_LIMIT_ERROR,
          message: 'Too many requests. Please wait and try again.',
          statusCode: status,
          originalError: error,
          retryable: true
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ApiErrorType.SERVER_ERROR,
          message: 'Server error. Please try again later.',
          statusCode: status,
          originalError: error,
          retryable: true
        };
      default:
        return {
          type: ApiErrorType.UNKNOWN_ERROR,
          message: `Unexpected error (${status}). Please try again.`,
          statusCode: status,
          originalError: error,
          retryable: true
        };
    }
  }

  return {
    type: ApiErrorType.UNKNOWN_ERROR,
    message: 'An unexpected error occurred.',
    originalError: error,
    retryable: false
  };
};

// Retry utility with exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = API_CONFIG.MAX_RETRIES,
  baseDelay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: ApiError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error);

      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.warn(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`, lastError.message);
      await sleep(delay);
    }
  }

  throw lastError!;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add token to all requests
        config.params = {
          ...config.params,
          token: API_CONFIG.TOKEN
        };

        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data
        });

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.url}`, {
          status: response.status,
          dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
          count: Array.isArray(response.data) ? response.data.length : 1
        });
        return response;
      },
      (error) => {
        const apiError = classifyError(error);
        console.error(`❌ API Error: ${error.config?.url}`, apiError);
        return Promise.reject(apiError);
      }
    );
  }

  // Industries API
  async getIndustries(): Promise<Industry[]> {
    const operation = 'getIndustries';
    const params = {};

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get('/industries');

        // Validate response structure
        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for industries');
        }

        return response.data.map((item: any) => ({
          id: item.id || item.industry_id || String(item.id),
          title: item.title || item.name || item.industry_name || 'Unknown Industry',
          description: item.description || item.desc || '',
          category: item.category || item.type || 'General',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn('🔄 Falling back to demo data for industries');
      return demoIndustries;
    }
  }

  // Departments API
  async getDepartments(industryId: string): Promise<Department[]> {
    const operation = 'getDepartments';
    const params = { industryId };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get(`/industry/${encodeURIComponent(industryId)}/departments`);

        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for departments');
        }

        return response.data.map((item: any) => ({
          id: item.id || item.department_id || String(item.id),
          title: item.title || item.name || item.department_name || 'Unknown Department',
          description: item.description || item.desc || '',
          category: item.category || item.type || 'General',
          industry_id: industryId,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn(`🔄 Falling back to demo data for departments (industry: ${industryId})`);
      return demoDepartments[industryId] || [];
    }
  }

  // Job Roles API
  async getJobRoles(departmentId: string): Promise<JobRole[]> {
    const operation = 'getJobRoles';
    const params = { departmentId };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get(`/department/${encodeURIComponent(departmentId)}/jobroles`);

        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for job roles');
        }

        return response.data.map((item: any) => ({
          id: item.id || item.jobrole_id || item.job_role_id || String(item.id),
          title: item.title || item.name || item.job_title || item.role_name || 'Unknown Role',
          description: item.description || item.desc || item.job_description || '',
          category: item.category || item.type || item.job_category || 'General',
          department_id: departmentId,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn(`🔄 Falling back to demo data for job roles (department: ${departmentId})`);
      return demoJobRoles[departmentId] || [];
    }
  }

  // Job Role Skills API
  async getJobRoleSkills(jobroleId: string): Promise<Skill[]> {
    const operation = 'getJobRoleSkills';
    const params = { jobroleId, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get(`/jobrole/${encodeURIComponent(jobroleId)}/skills`, {
          params: { sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID }
        });

        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for job role skills');
        }

        return response.data.map((item: any) => ({
          id: item.id || item.skill_id || String(item.id),
          title: item.title || item.name || item.skill_name || 'Unknown Skill',
          description: item.description || item.desc || item.skill_description || '',
          category: item.category || item.skill_category || item.type || 'General',
          level: item.level || item.proficiency_level || item.skill_level || 'Intermediate',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn(`🔄 Falling back to demo data for job role skills (jobrole: ${jobroleId})`);
      return demoSkills[jobroleId] || [];
    }
  }

  // Skills Search API
  async searchSkills(query: string): Promise<SearchResult[]> {
    const operation = 'searchSkills';
    const params = { query, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get('/skills/search', {
          params: {
            query: encodeURIComponent(query),
            sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID
          }
        });

        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for skill search');
        }

        return response.data.map((item: any) => ({
          id: item.id || item.skill_id || String(item.id),
          title: item.title || item.name || item.skill_name || 'Unknown Skill',
          description: item.description || item.desc || item.skill_description || '',
          category: item.category || item.skill_category || item.type || 'General',
          relevance_score: item.relevance_score || item.score || Math.random()
        }));
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn(`🔄 Falling back to demo data for skill search (query: ${query})`);
      // Filter demo search results based on query
      const filteredResults = demoSearchResults.filter(skill =>
        skill.title.toLowerCase().includes(query.toLowerCase()) ||
        skill.description.toLowerCase().includes(query.toLowerCase())
      );
      return filteredResults;
    }
  }

  // Property-based Search API
  async propertyBasedSearch(query: string, filters: any): Promise<SearchResult[]> {
    const operation = 'propertyBasedSearch';
    const params = { query, filters, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      const result = await retryWithBackoff(async () => {
        const searchParams = new URLSearchParams();
        searchParams.append('query', query);
        searchParams.append('sub_institute_id', API_CONFIG.SUB_INSTITUTE_ID);

        if (filters.industry) searchParams.append('industry', filters.industry);
        if (filters.department) searchParams.append('department', filters.department);
        if (filters.jobrole) searchParams.append('jobrole', filters.jobrole);

        const response = await this.client.get(`/search?${searchParams.toString()}`);

        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for property-based search');
        }

        return response.data.map((item: any) => ({
          id: item.id || String(item.id),
          title: item.title || item.name || 'Unknown Item',
          description: item.description || item.desc || '',
          category: item.category || item.type || 'General',
          relevance_score: item.relevance_score || item.score || Math.random()
        }));
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn('🔄 Falling back to demo data for property-based search');
      return this.filterDemoResults(query, filters);
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
      results = results.slice(0, Math.max(1, results.length - 2));
    }

    return results;
  }

  // Skill Path API (Legacy - keeping for backward compatibility)
  async getSkillPath(fromSkillId: string, toSkillId: string): Promise<SkillPath> {
    return this.getShortestPath(fromSkillId, toSkillId, 'skill');
  }

  // Shortest Path API
  async getShortestPath(sourceId: string, targetId: string, entityType: 'skill' | 'jobrole' = 'skill'): Promise<SkillPath> {
    const operation = 'getShortestPath';
    const params = { sourceId, targetId, entityType, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get('/graph/shortest-path', {
          params: {
            source: sourceId,
            target: targetId,
            type: entityType,
            sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID
          }
        });

        // Validate path structure
        if (!response.data || !Array.isArray(response.data.path)) {
          throw new Error('Invalid response structure for shortest path');
        }

        return {
          path: response.data.path.map((node: any) => ({
            id: node.id || String(node.id),
            title: node.title || node.name || 'Unknown Node',
            type: node.type || entityType
          })),
          distance: response.data.distance || response.data.path.length - 1
        };
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn('🔄 Falling back to demo data for shortest path');
      return this.generateDemoShortestPath(sourceId, targetId, entityType);
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
      { id: 'intermediate-1', title: 'Intermediate Node', type: 'skill' },
      { id: targetId, title: targetNode.title, type: entityType }
    ];

    return {
      path,
      distance: path.length - 1
    };
  }

  // CRUD Operations with Enhanced Error Handling

  // Create Skill
  async createSkill(skill: Partial<Skill>): Promise<Skill> {
    const operation = 'createSkill';
    const params = { skill, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.post('/skills', {
          ...skill,
          sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID,
          type: 'API'
        });

        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for create skill');
        }

        return {
          id: response.data.id || String(response.data.id),
          title: response.data.title || response.data.name || 'New Skill',
          description: response.data.description || '',
          category: response.data.category || 'General',
          level: response.data.level || response.data.proficiency_level || 'Intermediate',
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString()
        };
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);
      throw apiError;
    }
  }

  // Update Skill
  async updateSkill(skillId: string, skill: Partial<Skill>): Promise<Skill> {
    const operation = 'updateSkill';
    const params = { skillId, skill, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.put(`/skills/${skillId}`, {
          ...skill,
          sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID,
          type: 'API'
        });

        if (!validateResponse(response.data, ['id', 'title'])) {
          throw new Error('Invalid response structure for update skill');
        }

        return {
          id: response.data.id || skillId,
          title: response.data.title || response.data.name || 'Updated Skill',
          description: response.data.description || '',
          category: response.data.category || 'General',
          level: response.data.level || response.data.proficiency_level || 'Intermediate',
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString()
        };
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);
      throw apiError;
    }
  }

  // Delete Skill
  async deleteSkill(skillId: string): Promise<void> {
    const operation = 'deleteSkill';
    const params = { skillId, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      await retryWithBackoff(async () => {
        await this.client.delete(`/skills/${skillId}`, {
          params: {
            sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID,
            type: 'API'
          }
        });
      });

      logGraphQuery(operation, params, { success: true });
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);
      throw apiError;
    }
  }

  // Additional CRUD operations
  async addSkillToJobRole(jobroleId: string, skillId: string): Promise<void> {
    const operation = 'addSkillToJobRole';
    const params = { jobroleId, skillId, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      await retryWithBackoff(async () => {
        await this.client.post(`/jobrole/${jobroleId}/skills`, {
          skill_id: skillId,
          sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID
        });
      });

      logGraphQuery(operation, params, { success: true });
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);
      throw apiError;
    }
  }

  async addClassificationToSkill(skillId: string, classificationId: string): Promise<void> {
    const operation = 'addClassificationToSkill';
    const params = { skillId, classificationId, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      await retryWithBackoff(async () => {
        await this.client.post(`/skill/${skillId}/classification`, {
          classification_id: classificationId,
          sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID
        });
      });

      logGraphQuery(operation, params, { success: true });
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);
      throw apiError;
    }
  }

  // Get entity relationships
  async getEntityRelationships(entityType: string, entityId: string): Promise<any> {
    const operation = 'getEntityRelationships';
    const params = { entityType, entityId, sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get(`/${entityType}/${entityId}/relationships`, {
          params: { sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID }
        });

        return response.data || demoRelationships;
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn('🔄 Falling back to demo data for entity relationships');
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

// Export error types for use in components
//export { ApiError };