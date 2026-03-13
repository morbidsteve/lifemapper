export type PropertyType = 'house' | 'land' | 'house-and-land';
export type ProjectStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  description: string;
  imageUrl?: string;
  isCurrentHome: boolean;
  estimatedValue: number;
  mortgageBalance: number;
  monthlyPayment: number;
  projects: string[];
  notes: string;
  color: string;
}

export interface Project {
  id: string;
  propertyId: string | null;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  stressWeight: number;
  category: 'renovation' | 'sale' | 'purchase' | 'maintenance' | 'lifestyle' | 'financial' | 'other';
  dependencies: string[];
  assignees: string[];
  tasks: Task[];
  estimatedCost: number;
  actualCost: number;
  startDate: string | null;
  targetDate: string | null;
  completedDate: string | null;
  notes: string;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  dueDate: string | null;
  assignee: string | null;
}

export interface Person {
  id: string;
  name: string;
  role: 'self' | 'spouse' | 'contractor' | 'realtor' | 'family' | 'other';
  contact: string;
}

export interface FinancialEntry {
  id: string;
  projectId: string | null;
  propertyId: string | null;
  type: 'income' | 'expense' | 'projected-income' | 'projected-expense';
  amount: number;
  description: string;
  date: string;
  category: string;
}

export interface LifeMapperState {
  properties: Property[];
  projects: Project[];
  people: Person[];
  finances: FinancialEntry[];
  scenarios: Scenario[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  steps: ScenarioStep[];
}

export interface ScenarioStep {
  id: string;
  projectId: string;
  order: number;
  notes: string;
}

export type ViewType = 'board' | 'timeline' | 'dashboard' | 'decisions';
