import { SidebarItem, ProcessingStage } from "@/interfaces";

export const APP_NAME = "QA Validator";

export const ZENSAR_LOGO_URL =
  "https://images.ctfassets.net/bjl3f17nyta4/6IUeLrHvOQVPUxczuwnpG6/0b21114df102b72adf6e79d941c05e3b/zensar-logo-white.svg";

export const getProjectSidebarItems = (projectId: string): SidebarItem[] => [
  { label: "Overview", href: `/projects/${projectId}/overview`, icon: "overview" },
  { label: "Upload", href: `/projects/${projectId}/upload`, icon: "upload" },
  { label: "Requirements", href: `/projects/${projectId}/requirements`, icon: "requirements" },
  { label: "Test Cases", href: `/projects/${projectId}/test-cases`, icon: "test-cases" },
  { label: "Traceability Matrix", href: `/projects/${projectId}/traceability`, icon: "traceability" },
];

export const HARDCODED_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export const DEFAULT_USER = {
  username: "admin",
  name: "Admin User",
  role: "Administrator",
};

export const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".md",
  ".txt",
  ".doc",
  ".docx",
  ".rtf",
  ".csv",
];

export const PROCESSING_STAGES: ProcessingStage[] = [
  { label: "Uploading files...", duration: 1500, status: "pending" },
  { label: "Parsing documents...", duration: 2000, status: "pending" },
  { label: "Extracting requirements...", duration: 2500, status: "pending" },
  { label: "Generating test cases...", duration: 2000, status: "pending" },
  { label: "Building traceability matrix...", duration: 1500, status: "pending" },
];
