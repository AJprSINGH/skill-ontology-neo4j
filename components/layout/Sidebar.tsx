"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  Briefcase,
  Brain,
  Search,
  Network as NetworkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIndustries, useDepartments, useJobRoles } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface SidebarProps {
  selectedIndustry: string | null;
  selectedDepartment: string | null;
  selectedJobRole: string | null;
  onIndustrySelect: (industryId: string) => void;
  onDepartmentSelect: (departmentId: string) => void;
  onJobRoleSelect: (jobroleId: string) => void;
  onEntitySelect: (type: 'industry' | 'department' | 'jobrole', entity: any) => void;
}

export function Sidebar({
  selectedIndustry,
  selectedDepartment,
  selectedJobRole,
  onIndustrySelect,
  onDepartmentSelect,
  onJobRoleSelect,
  onEntitySelect,
}: SidebarProps) {
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set());
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  const { data: industries = [], isLoading: industriesLoading } = useIndustries();
  const { data: departments = [] } = useDepartments(selectedIndustry);
  const { data: jobRoles = [] } = useJobRoles(selectedDepartment);

  const toggleIndustry = (industryId: string) => {
    const newExpanded = new Set(expandedIndustries);
    if (newExpanded.has(industryId)) {
      newExpanded.delete(industryId);
    } else {
      newExpanded.add(industryId);
    }
    setExpandedIndustries(newExpanded);
  };

  const toggleDepartment = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  const handleIndustryClick = (industry: any) => {
    onIndustrySelect(industry.slug);
    onEntitySelect('industry', industry);
    toggleIndustry(industry.slug);
  };

  const handleDepartmentClick = (department: any) => {
    onDepartmentSelect(department.id);
    onEntitySelect('department', department);
    toggleDepartment(department.id);
  };

  const handleJobRoleClick = (jobRole: any) => {
    onJobRoleSelect(jobRole.id);
    onEntitySelect('jobrole', jobRole);
  };

  const LoadingState = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 p-2 text-slate-400">
      <LoadingSpinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );

  const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="p-2 text-slate-400 text-sm">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-blue-400 hover:text-blue-300 mt-1 text-xs underline"
        >
          Try again
        </button>
      )}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="w-80 bg-slate-900 text-white h-screen overflow-y-auto border-r border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <NetworkIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold">Skill Ontology</h1>
          </div>

          <nav className="space-y-2">
            {industriesLoading ? (
              <LoadingState text="Loading industries..." />
            ) : industries.length === 0 ? (
              <ErrorState message="No industries found" />
            ) : (
              industries.map((industry) => (
                <div key={industry.slug} className="space-y-1">
                  <button
                    onClick={() => handleIndustryClick(industry)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
                      "hover:bg-slate-800",
                      selectedIndustry === industry.slug && "bg-blue-600 text-white"
                    )}
                  >
                    {expandedIndustries.has(industry.slug) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{industry.title}</span>
                  </button>

                  <AnimatePresence>
                    {expandedIndustries.has(industry.slug) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-6 space-y-1 overflow-hidden"
                      >
                        {departments.length === 0 ? (
                          <ErrorState message="No departments found" />
                        ) : (
                          departments.map((department) => (
                            <div key={department.id} className="space-y-1">
                              <button
                                onClick={() => handleDepartmentClick(department)}
                                className={cn(
                                  "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
                                  "hover:bg-slate-700",
                                  selectedDepartment === department.id && "bg-teal-600 text-white"
                                )}
                              >
                                {expandedDepartments.has(department.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                <Users className="w-4 h-4" />
                                <span className="truncate">{department.title}</span>
                              </button>

                              <AnimatePresence>
                                {expandedDepartments.has(department.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="ml-6 space-y-1 overflow-hidden"
                                  >
                                    {jobRoles.length === 0 ? (
                                      <ErrorState message="No job roles found" />
                                    ) : (
                                      jobRoles.map((jobRole) => (
                                        <button
                                          key={jobRole.id}
                                          onClick={() => handleJobRoleClick(jobRole)}
                                          className={cn(
                                            "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
                                            "hover:bg-slate-600",
                                            selectedJobRole === jobRole.id && "bg-amber-600 text-white"
                                          )}
                                        >
                                          <Briefcase className="w-4 h-4" />
                                          <span className="truncate">{jobRole.title}</span>
                                        </button>
                                      ))
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </nav>
        </div>
      </div>
    </ErrorBoundary>
  );
}