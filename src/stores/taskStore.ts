import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Task, TaskStatus, TaskTemplate, Employee, UserRole } from '@/types';
import { mockTasksBatch2, mockTaskTemplates, mockUsers } from '@/utils/mockData';

interface TaskStore {
  tasks: Task[];
  createTasksFromTemplates: (
    batchId: string,
    templates: TaskTemplate[],
    employees: Employee[]
  ) => Task[];
  assignTask: (
    taskId: string,
    assigneeId: string,
    assigneeName: string,
    assigneeRole: UserRole,
    dueDate: string
  ) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useTaskStore = create<TaskStore>()(
  persist(
    immer((set, get) => ({
      tasks: mockTasksBatch2,

      createTasksFromTemplates: (batchId, templates, employees) => {
        const employeeIds = employees.map(e => e.id);
        const startDate = employees[0]?.joinDate
          ? new Date(employees[0].joinDate)
          : new Date();

        const newTasks: Task[] = templates.map((tpl) => {
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + tpl.defaultDueDays);

          const assignee = mockUsers.find(u => u.role === tpl.defaultRole) || mockUsers[0];

          return {
            id: generateId('task'),
            batchId,
            templateId: tpl.id,
            title: tpl.name,
            description: tpl.description,
            employeeIds: [...employeeIds],
            assigneeId: assignee.id,
            assigneeName: assignee.name,
            assigneeRole: assignee.role,
            status: 'pending',
            priority: tpl.defaultPriority,
            dueDate: dueDate.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
          };
        });

        set((state) => {
          state.tasks.push(...newTasks);
        });

        return newTasks;
      },

      assignTask: (taskId, assigneeId, assigneeName, assigneeRole, dueDate) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            task.assigneeId = assigneeId;
            task.assigneeName = assigneeName;
            task.assigneeRole = assigneeRole;
            task.dueDate = dueDate;
          }
        });
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            task.status = status;
            if (status === 'completed' && !task.completedAt) {
              task.completedAt = new Date().toISOString();
            } else if (status !== 'completed') {
              task.completedAt = undefined;
            }
          }
        });
      },

      updateTask: (taskId, data) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            Object.assign(task, data);
          }
        });
      },
    })),
    {
      name: 'task-store',
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
