import { Industry, Department, JobRole, Skill, SearchResult, SkillPath } from '@/types';

export const demoIndustries: Industry[] = [
  {
    slug: 'technology',
    id: 'tech-001',
    title: 'Technology',
    description: 'Companies focused on software development, hardware manufacturing, and digital innovation.',
    category: 'Digital',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    slug: 'finance',
    id: 'finance-001',
    title: 'Financial Services',
    description: 'Banking, investment, insurance, and other financial institutions.',
    category: 'Services',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    slug: 'healthcare',
    id: 'healthcare-001',
    title: 'Healthcare',
    description: 'Medical services, pharmaceuticals, and health technology companies.',
    category: 'Healthcare',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    slug: 'retail',
    id: 'retail-001',
    title: 'Retail & E-commerce',
    description: 'Traditional retail stores and online marketplace platforms.',
    category: 'Commerce',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const demoDepartments: Record<string, Department[]> = {
  'tech-001': [
    {
      id: 'eng-001',
      title: 'Engineering',
      description: 'Software development, system architecture, and technical innovation.',
      category: 'Technical',
      industry_id: 'tech-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'product-001',
      title: 'Product Management',
      description: 'Product strategy, roadmap planning, and feature development.',
      category: 'Strategy',
      industry_id: 'tech-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'design-001',
      title: 'Design',
      description: 'User experience design, visual design, and design systems.',
      category: 'Creative',
      industry_id: 'tech-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'finance-001': [
    {
      id: 'investment-001',
      title: 'Investment Banking',
      description: 'Corporate finance, mergers & acquisitions, and capital markets.',
      category: 'Finance',
      industry_id: 'finance-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'risk-001',
      title: 'Risk Management',
      description: 'Financial risk assessment, compliance, and regulatory oversight.',
      category: 'Compliance',
      industry_id: 'finance-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'healthcare-001': [
    {
      id: 'clinical-001',
      title: 'Clinical Operations',
      description: 'Patient care, medical procedures, and clinical research.',
      category: 'Medical',
      industry_id: 'healthcare-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'research-001',
      title: 'Research & Development',
      description: 'Drug discovery, medical device development, and clinical trials.',
      category: 'Research',
      industry_id: 'healthcare-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'retail-001': [
    {
      id: 'operations-001',
      title: 'Operations',
      description: 'Supply chain, inventory management, and logistics.',
      category: 'Operations',
      industry_id: 'retail-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'marketing-001',
      title: 'Marketing',
      description: 'Brand management, digital marketing, and customer acquisition.',
      category: 'Marketing',
      industry_id: 'retail-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
};

export const demoJobRoles: Record<string, JobRole[]> = {
  'eng-001': [
    {
      id: 'frontend-001',
      title: 'Frontend Developer',
      description: 'Develops user interfaces and client-side applications.',
      category: 'Development',
      department_id: 'eng-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'backend-001',
      title: 'Backend Developer',
      description: 'Builds server-side applications and APIs.',
      category: 'Development',
      department_id: 'eng-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'fullstack-001',
      title: 'Full Stack Developer',
      description: 'Works on both frontend and backend development.',
      category: 'Development',
      department_id: 'eng-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'product-001': [
    {
      id: 'pm-001',
      title: 'Product Manager',
      description: 'Defines product strategy and manages product lifecycle.',
      category: 'Management',
      department_id: 'product-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'po-001',
      title: 'Product Owner',
      description: 'Manages product backlog and stakeholder requirements.',
      category: 'Management',
      department_id: 'product-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'design-001': [
    {
      id: 'ux-001',
      title: 'UX Designer',
      description: 'Designs user experiences and interaction flows.',
      category: 'Design',
      department_id: 'design-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'ui-001',
      title: 'UI Designer',
      description: 'Creates visual designs and user interface components.',
      category: 'Design',
      department_id: 'design-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'investment-001': [
    {
      id: 'analyst-001',
      title: 'Investment Analyst',
      description: 'Analyzes investment opportunities and market trends.',
      category: 'Analysis',
      department_id: 'investment-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'risk-001': [
    {
      id: 'risk-analyst-001',
      title: 'Risk Analyst',
      description: 'Assesses and manages financial and operational risks.',
      category: 'Analysis',
      department_id: 'risk-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'clinical-001': [
    {
      id: 'nurse-001',
      title: 'Registered Nurse',
      description: 'Provides patient care and medical support.',
      category: 'Clinical',
      department_id: 'clinical-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'research-001': [
    {
      id: 'researcher-001',
      title: 'Research Scientist',
      description: 'Conducts medical research and clinical studies.',
      category: 'Research',
      department_id: 'research-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'operations-001': [
    {
      id: 'supply-001',
      title: 'Supply Chain Manager',
      description: 'Manages inventory, logistics, and vendor relationships.',
      category: 'Operations',
      department_id: 'operations-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'marketing-001': [
    {
      id: 'digital-001',
      title: 'Digital Marketing Manager',
      description: 'Manages online marketing campaigns and digital presence.',
      category: 'Marketing',
      department_id: 'marketing-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
};

export const demoSkills: Record<string, Skill[]> = {
  'frontend-001': [
    {
      id: 'react-001',
      title: 'React',
      description: 'JavaScript library for building user interfaces.',
      category: 'Frontend Framework',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'typescript-001',
      title: 'TypeScript',
      description: 'Typed superset of JavaScript for better development experience.',
      category: 'Programming Language',
      level: 'Intermediate',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'css-001',
      title: 'CSS',
      description: 'Styling language for web applications.',
      category: 'Styling',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'html-001',
      title: 'HTML',
      description: 'Markup language for structuring web content.',
      category: 'Markup',
      level: 'Expert',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'backend-001': [
    {
      id: 'nodejs-001',
      title: 'Node.js',
      description: 'JavaScript runtime for server-side development.',
      category: 'Backend Framework',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'python-001',
      title: 'Python',
      description: 'High-level programming language for backend development.',
      category: 'Programming Language',
      level: 'Intermediate',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sql-001',
      title: 'SQL',
      description: 'Database query language for data management.',
      category: 'Database',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'fullstack-001': [
    {
      id: 'react-002',
      title: 'React',
      description: 'JavaScript library for building user interfaces.',
      category: 'Frontend Framework',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'nodejs-002',
      title: 'Node.js',
      description: 'JavaScript runtime for server-side development.',
      category: 'Backend Framework',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mongodb-001',
      title: 'MongoDB',
      description: 'NoSQL database for modern applications.',
      category: 'Database',
      level: 'Intermediate',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'pm-001': [
    {
      id: 'strategy-001',
      title: 'Product Strategy',
      description: 'Ability to define and execute product vision and roadmap.',
      category: 'Strategy',
      level: 'Expert',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'analytics-001',
      title: 'Data Analytics',
      description: 'Analyzing user data and product metrics for insights.',
      category: 'Analytics',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'agile-001',
      title: 'Agile Methodology',
      description: 'Managing projects using agile frameworks like Scrum.',
      category: 'Methodology',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'ux-001': [
    {
      id: 'figma-001',
      title: 'Figma',
      description: 'Design tool for creating user interfaces and prototypes.',
      category: 'Design Tool',
      level: 'Expert',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'user-research-001',
      title: 'User Research',
      description: 'Conducting user interviews and usability testing.',
      category: 'Research',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'wireframing-001',
      title: 'Wireframing',
      description: 'Creating low-fidelity layouts and information architecture.',
      category: 'Design Process',
      level: 'Advanced',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
};

export const demoSearchResults: SearchResult[] = [
  {
    id: 'react-001',
    title: 'React',
    description: 'JavaScript library for building user interfaces.',
    category: 'Frontend Framework',
    relevance_score: 0.95
  },
  {
    id: 'typescript-001',
    title: 'TypeScript',
    description: 'Typed superset of JavaScript for better development experience.',
    category: 'Programming Language',
    relevance_score: 0.90
  },
  {
    id: 'nodejs-001',
    title: 'Node.js',
    description: 'JavaScript runtime for server-side development.',
    category: 'Backend Framework',
    relevance_score: 0.85
  },
  {
    id: 'python-001',
    title: 'Python',
    description: 'High-level programming language for backend development.',
    category: 'Programming Language',
    relevance_score: 0.80
  },
  {
    id: 'figma-001',
    title: 'Figma',
    description: 'Design tool for creating user interfaces and prototypes.',
    category: 'Design Tool',
    relevance_score: 0.75
  }
];

export const demoSkillPath: SkillPath = {
  path: [
    {
      id: 'html-001',
      title: 'HTML',
      type: 'skill'
    },
    {
      id: 'css-001',
      title: 'CSS',
      type: 'skill'
    },
    {
      id: 'javascript-001',
      title: 'JavaScript',
      type: 'skill'
    },
    {
      id: 'react-001',
      title: 'React',
      type: 'skill'
    }
  ],
  distance: 3
};

export const demoRelationships = {
  nodes: [
    { id: 'react-001', label: 'React', group: 'skill', color: '#8B5CF6' },
    { id: 'react-002', label: 'React', group: 'skill', color: '#8B5CF6' },
    { id: 'typescript-001', label: 'TypeScript', group: 'skill', color: '#8B5CF6' },
    { id: 'nodejs-001', label: 'Node.js', group: 'skill', color: '#8B5CF6' },
    { id: 'nodejs-002', label: 'Node.js', group: 'skill', color: '#8B5CF6' },
    { id: 'frontend-001', label: 'Frontend Developer', group: 'jobrole', color: '#F59E0B' },
    { id: 'fullstack-001', label: 'Full Stack Developer', group: 'jobrole', color: '#F59E0B' }
  ],
  edges: [
    { from: 'frontend-001', to: 'react-001', label: 'requires' },
    { from: 'frontend-001', to: 'typescript-001', label: 'requires' },
    { from: 'fullstack-001', to: 'react-002', label: 'requires' },
    { from: 'fullstack-001', to: 'nodejs-002', label: 'requires' },
    { from: 'react-001', to: 'typescript-001', label: 'works with' }
  ]
};