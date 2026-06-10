export type BatchStatus = 'draft' | 'importing' | 'processing' | 'in_progress' | 'completed' | 'archived';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'hr' | 'admin' | 'manager';

export type AccountType = 'email' | 'access_card' | 'id_badge' | 'vpn' | 'erp' | 'oa' | 'other';

export type DocumentCategory = 'contract' | 'agreement' | 'equipment' | 'other';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Batch {
  id: string;
  name: string;
  createdAt: string;
  status: BatchStatus;
  currentStep: number;
  progressPercent: number;
  employeeCount: number;
  completedTaskCount: number;
  totalTaskCount: number;
  startDate: string;
  notes?: string;
}

export interface Employee {
  id: string;
  batchId: string;
  name: string;
  position: string;
  joinDate: string;
  departmentId: string;
  departmentName: string;
  phone?: string;
  email?: string;
  idCard?: string;
  gender?: 'male' | 'female';
  managerId?: string;
  managerName?: string;
  workstation?: string;
  _missingFields?: string[];
}

export interface Department {
  id: string;
  name: string;
  managerName: string;
  managerEmail: string;
  employeeCount: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  thumbnail: string;
  requiredFields: string[];
  contentTemplate: string;
  isSelected?: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  defaultRole: UserRole;
  defaultPriority: TaskPriority;
  defaultDueDays: number;
}

export interface Task {
  id: string;
  batchId: string;
  templateId: string;
  title: string;
  description: string;
  employeeIds: string[];
  assigneeId: string;
  assigneeName: string;
  assigneeRole: UserRole;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface GeneratedDocument {
  id: string;
  batchId: string;
  templateId: string;
  templateName: string;
  employeeId: string;
  employeeName: string;
  fileUrl: string;
  fileSize: number;
  generatedAt: string;
}

export interface AccountItem {
  id: string;
  employeeId: string;
  type: AccountType;
  typeName: string;
  required: boolean;
  status: 'pending' | 'applying' | 'completed';
  applicant?: string;
  completedAt?: string;
  notes?: string;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  departmentId?: string;
}

export interface MissingFieldAlert {
  employeeId: string;
  employeeName: string;
  fields: string[];
}
