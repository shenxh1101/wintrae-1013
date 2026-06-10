import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Batch, Employee } from '@/types';
import { mockBatches, mockEmployees, mockDepartments } from '@/utils/mockData';

interface BatchStore {
  batches: Batch[];
  currentBatchId: string | null;
  employees: Employee[];
  createBatch: (data: Partial<Batch>) => Batch;
  updateBatch: (id: string, data: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  setCurrentBatch: (id: string | null) => void;
  importEmployees: (batchId: string, employees: Partial<Employee>[]) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const computeMissingFields = (emp: Partial<Employee>): string[] => {
  const requiredFields = ['name', 'position', 'joinDate', 'departmentName'];
  const missing: string[] = [];
  for (const field of requiredFields) {
    const value = (emp as Record<string, unknown>)[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }
  return missing;
};

const autoFillFields = (emp: Partial<Employee>, batchId: string): Employee => {
  const department = mockDepartments.find(d => d.id === emp.departmentId || d.name === emp.departmentName);

  const filled: Employee = {
    id: emp.id || generateId('emp'),
    batchId,
    name: emp.name || '',
    position: emp.position || '',
    joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
    departmentId: emp.departmentId || department?.id || '',
    departmentName: emp.departmentName || department?.name || '',
    phone: emp.phone,
    email: emp.email,
    idCard: emp.idCard,
    gender: emp.gender,
    managerId: emp.managerId || department?.managerEmail?.split('@')[0] || '',
    managerName: emp.managerName || department?.managerName,
    workstation: emp.workstation,
    _missingFields: [],
  };

  filled._missingFields = computeMissingFields(filled);
  return filled;
};

export const useBatchStore = create<BatchStore>()(
  persist(
    immer((set, get) => ({
      batches: mockBatches,
      currentBatchId: mockBatches[0]?.id || null,
      employees: mockEmployees,

      createBatch: (data) => {
        const newBatch: Batch = {
          id: generateId('batch'),
          name: data.name || '新建批次',
          createdAt: new Date().toISOString(),
          status: data.status || 'draft',
          currentStep: data.currentStep || 0,
          progressPercent: data.progressPercent || 0,
          employeeCount: 0,
          completedTaskCount: 0,
          totalTaskCount: 0,
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          notes: data.notes,
        };
        set((state) => {
          state.batches.push(newBatch);
          state.currentBatchId = newBatch.id;
        });
        return newBatch;
      },

      updateBatch: (id, data) => {
        set((state) => {
          const batch = state.batches.find(b => b.id === id);
          if (batch) {
            Object.assign(batch, data);
          }
        });
      },

      deleteBatch: (id) => {
        set((state) => {
          state.batches = state.batches.filter(b => b.id !== id);
          state.employees = state.employees.filter(e => e.batchId !== id);
          if (state.currentBatchId === id) {
            state.currentBatchId = state.batches[0]?.id || null;
          }
        });
      },

      setCurrentBatch: (id) => {
        set((state) => {
          state.currentBatchId = id;
        });
      },

      importEmployees: (batchId, employees) => {
        set((state) => {
          const processedEmployees = employees.map(emp => autoFillFields(emp, batchId));
          state.employees.push(...processedEmployees);

          const batch = state.batches.find(b => b.id === batchId);
          if (batch) {
            batch.employeeCount = state.employees.filter(e => e.batchId === batchId).length;
            if (batch.status === 'draft') {
              batch.status = 'importing';
              batch.currentStep = 1;
            }
          }
        });
      },

      updateEmployee: (id, data) => {
        set((state) => {
          const emp = state.employees.find(e => e.id === id);
          if (emp) {
            Object.assign(emp, data);
            emp._missingFields = computeMissingFields(emp);
          }
        });
      },
    })),
    {
      name: 'batch-store',
      partialize: (state) => ({
        batches: state.batches,
        currentBatchId: state.currentBatchId,
        employees: state.employees,
      }),
    }
  )
);
