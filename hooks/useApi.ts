"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryApi, crudApi } from '@/services/api';
import { Skill } from '@/types';

// Query hooks
export const useIndustries = () => {
  return useQuery({
    queryKey: ['industries'],
    queryFn: queryApi.getIndustries,
  });
};

export const useDepartments = (industryId: string | null) => {
  return useQuery({
    queryKey: ['departments', industryId],
    queryFn: () => queryApi.getDepartments(industryId!),
    enabled: !!industryId,
  });
};

export const useJobRoles = (departmentId: string | null) => {
  return useQuery({
    queryKey: ['jobroles', departmentId],
    queryFn: () => queryApi.getJobRoles(departmentId!),
    enabled: !!departmentId,
  });
};

export const useJobRoleSkills = (jobroleId: string | null) => {
  return useQuery({
    queryKey: ['jobrole-skills', jobroleId],
    queryFn: () => queryApi.getJobRoleSkills(jobroleId!),
    enabled: !!jobroleId,
  });
};

export const useSkillSearch = (query: string) => {
  return useQuery({
    queryKey: ['skill-search', query],
    queryFn: () => queryApi.searchSkills(query),
    enabled: query.length > 2,
    staleTime: 5000,
  });
};

export const useSkillPath = (fromSkillId: string | null, toSkillId: string | null) => {
  return useQuery({
    queryKey: ['skill-path', fromSkillId, toSkillId],
    queryFn: () => queryApi.getSkillPath(fromSkillId!, toSkillId!),
    enabled: !!fromSkillId && !!toSkillId,
  });
};

export const useEntityRelationships = (entityType: string, entityId: string | null) => {
  return useQuery({
    queryKey: ['entity-relationships', entityType, entityId],
    queryFn: () => queryApi.getEntityRelationships(entityType, entityId!),
    enabled: !!entityId,
  });
};

// Mutation hooks
export const useCreateSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (skill: Partial<Skill>) => crudApi.createSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ skillId, skill }: { skillId: string; skill: Partial<Skill> }) =>
      crudApi.updateSkill(skillId, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (skillId: string) => crudApi.deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};