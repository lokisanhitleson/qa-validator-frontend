export interface User {
  username: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: "Functional" | "Non-Functional";
  priority: "High" | "Medium" | "Low";
  status: "Approved" | "Draft" | "In Review";
  segment: string;
}

export interface TestStep {
  step: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: "Positive" | "Negative" | "Boundary";
  priority: "High" | "Medium" | "Low";
  status: "Ready" | "Draft" | "In Review";
  steps: TestStep[];
  linkedRequirements: string[];
  segment: string;
}

export interface TraceabilityLink {
  requirementId: string;
  requirementTitle: string;
  linkedTestCases: string[];
  coverage: "Covered" | "Partial" | "Uncovered";
  segment: string;
}

export interface TraceabilityMatrix {
  links: TraceabilityLink[];
  summary: {
    totalRequirements: number;
    coveredRequirements: number;
    coveragePercentage: number;
  };
}

export interface ProjectData {
  requirements: Requirement[];
  testCases: TestCase[];
  traceability: TraceabilityMatrix;
}

export interface SelectedFile {
  file: File;
  isValid: boolean;
  error?: string;
}

export interface ProcessingStage {
  label: string;
  duration: number;
  status: "pending" | "active" | "completed";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: "Active" | "Completed" | "Draft";
}
