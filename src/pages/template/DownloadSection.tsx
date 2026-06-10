import React, { useState } from 'react';
import { Download, FileText, ChevronDown, ChevronUp, Package, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type { GeneratedDocument, Employee } from '@/types';

interface DownloadSectionProps {
  documents: GeneratedDocument[];
  employees: Employee[];
  className?: string;
}

const formatSize = (kb: number) => {
  if (kb < 1024) return kb + ' KB';
  return (kb / 1024).toFixed(2) + ' MB';
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const categoryColors: Record<string, string> = {
  contract: 'from-success-50 to-success-100 border-success-200',
  agreement: 'from-info-50 to-info-100 border-info-200',
  equipment: 'from-warning-50 to-warning-100 border-warning-200',
  other: 'from-slatebg-50 to-slatebg-100 border-slatebg-200',
};

const DownloadSection: React.FC<DownloadSectionProps> = ({
  documents,
  employees,
  className,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (documents.length === 0) return null;

  const docsByEmployee = employees.reduce<Record<string, GeneratedDocument[]>>((acc, emp) => {
    const empDocs = documents.filter((d) => d.employeeId === emp.id);
    if (empDocs.length > 0) {
      acc[emp.id] = empDocs;
    }
    return acc;
  }, {});

  const employeeIdsWithDocs = Object.keys(docsByEmployee);

  if (employeeIdsWithDocs.length === 0) return null;

  const toggleGroup = (empId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  };

  const handleDownloadAll = () => {
    console.log('Download all:', documents.length, 'files');
  };

  const handleDownloadEmployee = (empId: string) => {
    const empDocs = docsByEmployee[empId];
    console.log('Download for employee:', empId, empDocs.length, 'files');
  };

  const handleDownloadSingle = (doc: GeneratedDocument) => {
    console.log('Download:', doc.templateName, doc.fileUrl);
  };

  const totalSize = documents.reduce((sum, d) => sum + d.fileSize, 0);

  return (
    <div className={cn('flex flex-col gap-4 animate-fade-in', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-copper-500 flex items-center justify-center shadow-md">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-navy-800 font-serif">文档下载区</h3>
            <p className="text-sm text-navy-500">
              已生成 {documents.length} 份文档 · 共 {formatSize(totalSize)} · 涉及 {employeeIdsWithDocs.length} 名员工
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleDownloadAll}
        >
          批量下载全部
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {employeeIdsWithDocs.map((empId) => {
          const employee = employees.find((e) => e.id === empId);
          const empDocs = docsByEmployee[empId];
          const isExpanded = expandedGroups.has(empId);

          if (!employee) return null;

          return (
            <div
              key={empId}
              className={cn(
                'rounded-2xl border overflow-hidden transition-all duration-300',
                isExpanded ? 'border-navy-200 shadow-md' : 'border-slatebg-200'
              )}
            >
              <button
                onClick={() => toggleGroup(empId)}
                className={cn(
                  'w-full flex items-center justify-between p-4 transition-colors',
                  'bg-gradient-to-r from-white via-slatebg-50/50 to-white hover:from-slatebg-50 hover:to-slatebg-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-600 to-copper-500 flex items-center justify-center text-white font-semibold shadow-md">
                    {employee.name ? employee.name[0] : '?'}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-navy-800">{employee.name}</h4>
                      <span className="text-xs text-navy-400">{employee.position}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-navy-500">{employee.departmentName}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-navy-500">
                        <FileText className="w-3 h-3" />
                        {empDocs.length} 份文档
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        全部生成完成
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadEmployee(empId);
                    }}
                  >
                    下载全部
                  </Button>
                  <div className={cn(
                    'p-2 rounded-lg transition-transform duration-300',
                    isExpanded ? 'rotate-180' : ''
                  )}>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-navy-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-navy-400" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slatebg-100 bg-slatebg-50/30 animate-slide-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {empDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={cn(
                          'p-4 rounded-xl border transition-all duration-200',
                          'bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer group',
                          categoryColors[doc.templateId.startsWith('tpl-doc-00') ? (
                            doc.templateId === 'tpl-doc-001' ? 'contract' :
                            doc.templateId === 'tpl-doc-002' || doc.templateId === 'tpl-doc-003' ? 'agreement' :
                            doc.templateId === 'tpl-doc-004' ? 'equipment' : 'other'
                          ) : 'other']
                        )}
                        onClick={() => handleDownloadSingle(doc)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/80 border border-white flex items-center justify-center shadow-sm shrink-0">
                            <FileText className="w-5 h-5 text-navy-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-navy-800 truncate text-sm">
                              {doc.templateName}
                            </h5>
                            <div className="flex items-center gap-2 mt-1 text-xs text-navy-500">
                              <span>{formatSize(doc.fileSize)}</span>
                              <span className="w-1 h-1 rounded-full bg-navy-300" />
                              <span className="inline-flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {formatTime(doc.generatedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="w-4 h-4 text-navy-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DownloadSection;
