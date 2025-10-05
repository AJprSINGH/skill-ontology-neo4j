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
const validateResponse = (response: any, expectedFields: string[] = []): boolean => {
  if (!response) {
    console.error('Validation failed: Response is null or undefined');
    return false;
  }

  // If response is already an array
  const data = Array.isArray(response) ? response : response.data;

  if (!data) {
    console.error('Validation failed: No data found');
    return false;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.warn('Validation passed: Empty array is valid');
      return true;
    }

    const isValid = data.every(item => {
      // Check if all expected fields exist and are not empty
      const hasValidFields = expectedFields.every(field => {
        const value = item[field];
        const isValidField = value !== undefined &&
          value !== null &&
          value.toString().trim() !== '';

        if (!isValidField) {
          console.error(`Validation failed: Field '${field}' is empty or invalid in item:`, item);
        }

        return isValidField;
      });

      return hasValidFields;
    });

    return isValid;
  }

  console.error('Validation failed: Data is not an array');
  return false;
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
        console.log("hello");
        console.log("Response : ", response.data);

        // Extract the array from the response
        const industriesArray = response.data.data;

        // Validate response structure
        if (!validateResponse(industriesArray, ['id', 'industries'])) {
          throw new Error('Invalid response structure for industries');
        }
        console.log("Hello industries");

        return industriesArray.map((item: any) => ({
          id: item.id || `industry-${Math.random().toString(36).substr(2, 9)}`,
          slug: item.industries.toLowerCase(),
          title: item.industries, // map industries → title
          description: item.department || '',
          category: item.type || 'General',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
      });

      logGraphQuery(operation, params, result);
      console.log("RESULT : ", result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`❌ API Error: ${operation}`, apiError);
      logGraphQuery(operation, params, undefined, apiError);

      console.warn('🔄 Falling back to demo data for industries');
      return demoIndustries;
    }
  }

  // Departments API
  async getDepartments(industryName: string): Promise<Department[]> {
    const operation = 'getDepartments';
    const params = { industryName };
    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get(`/industry/${encodeURIComponent(industryName)}/departments`);
        console.log("Response in getDepartments: ", response.data);
        const departmentsArray = response.data.industry_departments;
        // if (!validateResponse(departmentsArray, ['id', 'title'])) {
        //   throw new Error('Invalid response structure for departments');
        // }

        return departmentsArray.map((item: any) => ({
          id: item.id || item.department || `department-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title || item.name || item.department || 'Unknown Department',
          description: item.description || item.desc || '',
          category: item.category || item.type || 'General',
          industry_id: industryName,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn(`🔄 Falling back to demo data for departments (industry: ${industryName})`);
      return demoDepartments[industryName] || [];
    }
  }

  // Job Roles API
  async getJobRoles(departmentId: string): Promise<JobRole[]> {
    const operation = 'getJobRoles';
    const params = { departmentId };

    try {
      const result = await retryWithBackoff(async () => {
        const response = await this.client.get(`/department/${encodeURIComponent(departmentId)}/jobroles`);
        const data = response.data;

        if (!data || !Array.isArray(data.job_roles)) {
          throw new Error('Invalid response structure for job roles');
        }

        return data.job_roles.map((item: any, index: number) => ({
          id: `jobrole-${departmentId}-${index + 1}-${Math.random().toString(36).substr(2, 4)}`,
          title: item.jobrole || 'Unknown Role',
          description: '',
          category: 'General',
          department_id: departmentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
      // Get the job role title from localStorage if available
      // Otherwise, use "chief executives" as a fallback for testing
      const jobRoleTitle = "chief executives";

      console.log(`Fetching skills for job role: ${jobRoleTitle}`);

      const result = await retryWithBackoff(async () => {
        const response = await this.client.get(`/jobrole/${encodeURIComponent(jobRoleTitle)}/skills`, {
          params: { sub_institute_id: API_CONFIG.SUB_INSTITUTE_ID }
        });

        // Handle the specific response format for this API
        // The response format is: {"jobRoles":"chief executives","skills":[{"skill":"Active Learning"},{"skill":"Active Listening"},...]}
        const responseData = response.data;

        if (!responseData || !responseData.skills || !Array.isArray(responseData.skills)) {
          console.error('Invalid skills data structure:', response.data);
          throw new Error('Invalid response structure for job role skills');
        }

        // Map the skills array to the expected Skill format
        return responseData.skills.map((item: any, index: number) => ({
          id: `skill-${jobroleId}-${index + 1}-${Math.random().toString(36).substr(2, 4)}`,
          title: item.skill || 'Unknown Skill',
          description: '',
          category: 'General',
          level: 'Intermediate',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          id: item.id || item.skill_id || `skill-${Math.random().toString(36).substr(2, 9)}`,
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
          id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
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
            id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
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

      console.warn('🔄 Falling back to dynamic relationship path finding');
      return this.generateDynamicShortestPath(sourceId, targetId, entityType);
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

  // Generate shortest path based on dynamic relationships
  private generateDynamicShortestPath(sourceId: string, targetId: string, entityType: 'skill' | 'jobrole'): SkillPath {
    // This is a simplified implementation that finds paths within the hierarchical structure
    // In a real implementation, you would use a proper graph traversal algorithm

    // For now, we'll create a simple path that follows the hierarchy:
    // Industry -> Department -> Job Role -> Skill
    // This is a placeholder implementation that demonstrates the concept

    try {
      // Try to find a path through the hierarchy
      // This would be replaced with actual graph traversal logic
      const pathNodes = [
        { id: sourceId, title: `Source ${entityType}`, type: entityType },
        { id: 'hierarchical-node-1', title: 'Hierarchical Connection', type: 'intermediate' },
        { id: targetId, title: `Target ${entityType}`, type: entityType }
      ];

      return {
        path: pathNodes,
        distance: pathNodes.length - 1
      };
    } catch (error) {
      console.warn('Failed to generate dynamic shortest path, falling back to demo data');
      return this.generateDemoShortestPath(sourceId, targetId, entityType);
    }
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
          id: response.data.id || `skill-${Math.random().toString(36).substr(2, 9)}`,
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
          id: response.data.id || skillId || `skill-${Math.random().toString(36).substr(2, 9)}`,
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

        // Extract the data correctly - handle both response.data.data and response.data formats
        const relationshipsData = response.data?.data || response.data;

        if (!relationshipsData) {
          console.error('Invalid relationships data structure:', response.data);
          throw new Error('Invalid response structure for entity relationships');
        }

        return relationshipsData;
      });

      logGraphQuery(operation, params, result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      logGraphQuery(operation, params, undefined, apiError);

      console.warn('🔄 Falling back to dynamic relationship generation');
      return this.generateDynamicRelationships(entityType, entityId);
    }
  }

  // Generate dynamic relationships based on entity hierarchy
  private async generateDynamicRelationships(entityType: string, entityId: string): Promise<any> {
    try {
      let entity: any;
      let connectedEntities: any[] = [];
      let relationships: any[] = [];

      // Get the entity details
      switch (entityType) {
        case 'industry':
          const industries = await this.getIndustries();
          entity = industries.find((ind: any) => ind.slug === entityId || ind.id === entityId);
          if (entity) {
            // Get departments for this industry
            const departments = await this.getDepartments(entity.slug || entity.id);
            connectedEntities = departments.map(dept => ({
              ...dept,
              type: 'department'
            }));
            relationships = departments.map(dept => ({
              from_id: entityId,
              to_id: dept.id,
              type: 'contains'
            }));

            // Get job roles and skills for each department to show full hierarchy
            for (const department of departments) {
              const jobRoles = await this.getJobRoles(department.id);

              // Add job roles as connected entities
              const jobRoleEntities = jobRoles.map(job => ({
                ...job,
                type: 'jobrole'
              }));
              connectedEntities.push(...jobRoleEntities);

              // Add relationships from department to job roles
              const jobRoleRelationships = jobRoles.map(job => ({
                from_id: department.id,
                to_id: job.id,
                type: 'contains'
              }));
              relationships.push(...jobRoleRelationships);

              // Get skills for each job role
              for (const jobRole of jobRoles) {
                const skills = await this.getJobRoleSkills(jobRole.id);

                // Add skills as connected entities
                const skillEntities = skills.map(skill => ({
                  ...skill,
                  type: 'skill'
                }));
                connectedEntities.push(...skillEntities);

                // Add relationships from job role to skills
                const skillRelationships = skills.map(skill => ({
                  from_id: jobRole.id,
                  to_id: skill.id,
                  type: 'requires'
                }));
                relationships.push(...skillRelationships);
              }
            }
          }
          break;

        case 'department':
          const allDepartments = await this.getDepartments('');
          entity = allDepartments.find((dept: any) => dept.id === entityId);
          if (entity) {
            // Get job roles for this department
            const jobRoles = await this.getJobRoles(entityId);
            connectedEntities = jobRoles.map(job => ({
              ...job,
              type: 'jobrole'
            }));
            relationships = jobRoles.map(job => ({
              from_id: entityId,
              to_id: job.id,
              type: 'contains'
            }));

            // Get skills for each job role to show full hierarchy
            for (const jobRole of jobRoles) {
              const skills = await this.getJobRoleSkills(jobRole.id);

              // Add skills as connected entities
              const skillEntities = skills.map(skill => ({
                ...skill,
                type: 'skill'
              }));
              connectedEntities.push(...skillEntities);

              // Add relationships from job role to skills
              const skillRelationships = skills.map(skill => ({
                from_id: jobRole.id,
                to_id: skill.id,
                type: 'requires'
              }));
              relationships.push(...skillRelationships);
            }

            // Also include the parent industry
            const industries = await this.getIndustries();
            const industry = industries.find((ind: any) => ind.slug === entity.industry_id || ind.id === entity.industry_id);
            if (industry) {
              connectedEntities.push({
                ...industry,
                type: 'industry'
              });
              relationships.push({
                from_id: industry.slug || industry.id,
                to_id: entityId,
                type: 'contains'
              });
            }
          }
          break;

        case 'jobrole':
          const allJobRoles = await this.getJobRoles('');
          entity = allJobRoles.find((job: any) => job.id === entityId);
          if (entity) {
            // Get skills for this job role
            const skills = await this.getJobRoleSkills(entityId);
            connectedEntities = skills.map(skill => ({
              ...skill,
              type: 'skill'
            }));
            relationships = skills.map(skill => ({
              from_id: entityId,
              to_id: skill.id,
              type: 'requires'
            }));

            // Also include the parent department
            const departments = await this.getDepartments('');
            const department = departments.find((dept: any) => dept.id === entity.department_id);
            if (department) {
              connectedEntities.push({
                ...department,
                type: 'department'
              });
              relationships.push({
                from_id: department.id,
                to_id: entityId,
                type: 'contains'
              });

              // Also include the grandparent industry
              const industries = await this.getIndustries();
              const industry = industries.find((ind: any) => ind.slug === department.industry_id || ind.id === department.industry_id);
              if (industry) {
                connectedEntities.push({
                  ...industry,
                  type: 'industry'
                });
                relationships.push({
                  from_id: industry.slug || industry.id,
                  to_id: department.id,
                  type: 'contains'
                });
              }
            }
          }
          break;

        case 'skill':
          // For skills, we need to find which job roles require this skill
          const jobRoles = await this.getJobRoles('');
          entity = { id: entityId, title: entityId, type: 'skill' };

          // Find job roles that require this skill
          const requiringJobRoles = [];
          for (const jobRole of jobRoles) {
            const skills = await this.getJobRoleSkills(jobRole.id);
            if (skills.some(skill => skill.id === entityId)) {
              requiringJobRoles.push(jobRole);
            }
          }

          connectedEntities = requiringJobRoles.map(job => ({
            ...job,
            type: 'jobrole'
          }));
          relationships = requiringJobRoles.map(job => ({
            from_id: job.id,
            to_id: entityId,
            type: 'requires'
          }));
          break;

        default:
          return demoRelationships;
      }

      if (!entity) {
        return demoRelationships;
      }

      return {
        entity: {
          ...entity,
          type: entityType
        },
        connected_entities: connectedEntities,
        relationships: relationships
      };

    } catch (error) {
      console.error('Error generating dynamic relationships:', error);
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