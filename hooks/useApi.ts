"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryApi, crudApi, ApiError, ApiErrorType } from '@/services/api';
import { Skill } from '@/types';
import { toast } from 'sonner';

// Enhanced error handling utility
const handleApiError = (error: ApiError, operation: string) => {
  console.error(`❌ ${operation} failed:`, error);

  // Show user-friendly error messages
  switch (error.type) {
    case ApiErrorType.NETWORK_ERROR:
      toast.error('Network Error', {
        description: 'Please check your internet connection and try again.'
      });
      break;
    case ApiErrorType.TIMEOUT_ERROR:
      toast.error('Request Timeout', {
        description: 'The request took too long. Please try again.'
      });
      break;
    case ApiErrorType.AUTHENTICATION_ERROR:
      toast.error('Authentication Failed', {
        description: 'Please check your credentials and try again.'
      });
      break;
    case ApiErrorType.RATE_LIMIT_ERROR:
      toast.error('Too Many Requests', {
        description: 'Please wait a moment before trying again.'
      });
      break;
    case ApiErrorType.SERVER_ERROR:
      toast.error('Server Error', {
        description: 'Our servers are experiencing issues. Please try again later.'
      });
      break;
    default:
      toast.error('Error', {
        description: error.message || 'An unexpected error occurred.'
      });
  }
};

// Enhanced query configuration
const getQueryConfig = (operation: string) => ({
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: (failureCount: number, error: any) => {
    // Don't retry non-retryable errors
    if (error?.retryable === false) return false;
    // Retry up to 3 times for retryable errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  onError: (error: ApiError) => handleApiError(error, operation),
});

// Query hooks
export const useIndustries = () => {
  return useQuery({
    queryKey: ['industries'],
    queryFn: queryApi.getIndustries,
    ...getQueryConfig('Load Industries'),
  });
};

export const useDepartments = (industryId: string | null) => {
  return useQuery({
    queryKey: ['departments', industryId],
    queryFn: () => queryApi.getDepartments(industryId!),
    enabled: !!industryId,
    ...getQueryConfig('Load Departments'),
  });
};

export const useJobRoles = (departmentId: string | null) => {
  return useQuery({
    queryKey: ['jobroles', departmentId],
    queryFn: () => queryApi.getJobRoles(departmentId!),
    enabled: !!departmentId,
    ...getQueryConfig('Load Job Roles'),
  });
};

export const useJobRoleSkills = (jobroleId: string | null) => {
  return useQuery({
    queryKey: ['jobrole-skills', jobroleId],
    queryFn: () => queryApi.getJobRoleSkills(jobroleId!),
    enabled: !!jobroleId,
    ...getQueryConfig('Load Job Role Skills'),
  });
};

export const useSkillSearch = (query: string) => {
  return useQuery({
    queryKey: ['skill-search', query],
    queryFn: () => queryApi.searchSkills(query),
    enabled: query.length > 2,
    ...getQueryConfig('Search Skills'),
  });
};

export const usePropertyBasedSearch = (query: string, filters: any) => {
  return useQuery({
    queryKey: ['property-search', query, filters],
    queryFn: () => queryApi.propertyBasedSearch(query, filters),
    enabled: query.length > 2,
    ...getQueryConfig('Property-Based Search'),
  });
};

export const useSkillPath = (fromSkillId: string | null, toSkillId: string | null) => {
  return useQuery({
    queryKey: ['skill-path', fromSkillId, toSkillId],
    queryFn: () => queryApi.getSkillPath(fromSkillId!, toSkillId!),
    enabled: !!fromSkillId && !!toSkillId,
    ...getQueryConfig('Find Skill Path'),
  });
};

export const useShortestPath = (sourceId: string | null, targetId: string | null, entityType: 'skill' | 'jobrole' = 'skill') => {
  return useQuery({
    queryKey: ['shortest-path', sourceId, targetId, entityType],
    queryFn: () => queryApi.getShortestPath(sourceId!, targetId!, entityType),
    enabled: !!sourceId && !!targetId && sourceId !== targetId,
    ...getQueryConfig('Find Shortest Path'),
  });
};

export const useEntityRelationships = (entityType: string, entityId: string | null) => {
  return useQuery({
    queryKey: ['entity-relationships', entityType, entityId],
    queryFn: () => queryApi.getEntityRelationships(entityType, entityId!),
    enabled: !!entityId,
    ...getQueryConfig('Load Entity Relationships'),
  });
};

// Enhanced mutation configuration
const getMutationConfig = (operation: string, successMessage: string) => ({
  onSuccess: () => {
    toast.success('Success', {
      description: successMessage
    });
  },
  onError: (error: ApiError) => handleApiError(error, operation),
});


export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skill: Partial<Skill>) => crudApi.createSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill-search'] });
      queryClient.invalidateQueries({ queryKey: ['jobrole-skills'] });
      // Success toast from getMutationConfig
      toast.success('Success', {
        description: 'Skill created successfully!'
      });
    },
    onError: (error: ApiError) => handleApiError(error, 'Create Skill'),
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ skillId, skill }: { skillId: string; skill: Partial<Skill> }) =>
      crudApi.updateSkill(skillId, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill-search'] });
      queryClient.invalidateQueries({ queryKey: ['jobrole-skills'] });
      // Success toast from getMutationConfig
      toast.success('Success', {
        description: 'Skill Updated successfully!'
      });
    },
    onError: (error: ApiError) => handleApiError(error, 'Create Skill'),
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => crudApi.deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill-search'] });
      queryClient.invalidateQueries({ queryKey: ['jobrole-skills'] });
      // Success toast from getMutationConfig
      toast.success('Success', {
        description: 'Skill deleted successfully!'
      });
    },
    onError: (error: ApiError) => handleApiError(error, 'Create Skill'),
  });
};