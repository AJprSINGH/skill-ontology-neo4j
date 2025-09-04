export interface Industry {
  id: string;
  title: string;
  description: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  title: string;
  description: string;
  category?: string;
  industry_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobRole {
  id: string;
  title: string;
  description: string;
  category?: string;
  department_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CriticalWorkFunction {
  id: string;
  title: string;
  description: string;
  category?: string;
  jobrole_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Classification {
  id: string;
  title: string;
  description: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface RelationshipNode {
  id: string;
  label: string;
  title?: string;
  group?: string;
  color?: string;
}

export interface RelationshipEdge {
  from: string;
  to: string;
  label?: string;
  arrows?: string;
}

export interface PathNode {
  id: string;
  title: string;
  type: string;
}

export interface SkillPath {
  path: PathNode[];
  distance: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category?: string;
  relevance_score?: number;
}