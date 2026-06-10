import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { DocumentTemplate, GeneratedDocument, Employee } from '@/types';
import { mockDocumentTemplates } from '@/utils/mockData';

interface TemplateStore {
  templates: DocumentTemplate[];
  selectedTemplateIds: string[];
  generatedDocs: GeneratedDocument[];
  toggleTemplate: (templateId: string) => void;
  clearSelection: () => void;
  generateDocuments: (batchId: string, employees: Employee[]) => Promise<GeneratedDocument[]>;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useTemplateStore = create<TemplateStore>()(
  persist(
    immer((set, get) => ({
      templates: mockDocumentTemplates,
      selectedTemplateIds: [],
      generatedDocs: [],

      toggleTemplate: (templateId) => {
        set((state) => {
          const idx = state.selectedTemplateIds.indexOf(templateId);
          if (idx >= 0) {
            state.selectedTemplateIds.splice(idx, 1);
          } else {
            state.selectedTemplateIds.push(templateId);
          }
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selectedTemplateIds = [];
        });
      },

      generateDocuments: async (batchId, employees) => {
        const { selectedTemplateIds, templates } = get();

        const newDocs: GeneratedDocument[] = [];
        const selectedTemplates = templates.filter(t => selectedTemplateIds.includes(t.id));

        for (const template of selectedTemplates) {
          for (const employee of employees) {
            await new Promise(resolve => setTimeout(resolve, 50));
            newDocs.push({
              id: generateId('doc'),
              batchId,
              templateId: template.id,
              templateName: template.name,
              employeeId: employee.id,
              employeeName: employee.name,
              fileUrl: `blob:/docs/${batchId}/${template.id}_${employee.id}.pdf`,
              fileSize: Math.floor(Math.random() * 500) + 100,
              generatedAt: new Date().toISOString(),
            });
          }
        }

        set((state) => {
          state.generatedDocs.push(...newDocs);
        });

        return newDocs;
      },
    })),
    {
      name: 'template-store',
      partialize: (state) => ({
        templates: state.templates,
        selectedTemplateIds: state.selectedTemplateIds,
        generatedDocs: state.generatedDocs,
      }),
    }
  )
);
