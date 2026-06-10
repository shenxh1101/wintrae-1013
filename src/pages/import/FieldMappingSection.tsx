import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Link2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, Button } from '@/components/common';

interface FieldMappingSectionProps {
  importColumns: string[];
  mappings: Record<string, string>;
  onMappingChange: (importCol: string, systemField: string) => void;
  onAutoMap: () => void;
  className?: string;
}

const systemFields = [
  { value: 'name', label: '姓名', required: true },
  { value: 'position', label: '岗位', required: true },
  { value: 'joinDate', label: '入职日期', required: true },
  { value: 'departmentName', label: '部门', required: true },
  { value: 'phone', label: '手机号', required: false },
  { value: 'email', label: '邮箱', required: false },
  { value: 'idCard', label: '身份证', required: false },
  { value: 'gender', label: '性别', required: false },
  { value: 'managerName', label: '部门主管', required: false },
];

const FieldMappingSection: React.FC<FieldMappingSectionProps> = ({
  importColumns,
  mappings,
  onMappingChange,
  onAutoMap,
  className,
}) => {
  const [expanded, setExpanded] = useState(true);

  if (importColumns.length === 0) return null;

  const options = [
    { value: '', label: '-- 跳过该列 --' },
    ...systemFields.map(f => ({ value: f.value, label: `${f.label}${f.required ? ' (必填)' : ''}` })),
  ];

  const usedFields = Object.values(mappings).filter(Boolean);
  const requiredMapped = ['name', 'position', 'joinDate', 'departmentName'].every(f => usedFields.includes(f));

  return (
    <div
      className={cn(
        'border border-slatebg-200 rounded-xl overflow-hidden shadow-sm animate-slide-in',
        className
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slatebg-50/70 hover:bg-slatebg-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy-100 to-copper-100 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-navy-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-navy-800">字段映射配置</h3>
            <p className="text-sm text-navy-500">
              将导入的列名对应到系统字段
              {requiredMapped ? (
                <span className="ml-2 text-success-600 font-medium">✓ 必选字段已全部映射</span>
              ) : (
                <span className="ml-2 text-warning-600 font-medium">请完成必选字段映射</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onAutoMap();
            }}
          >
            智能匹配
          </Button>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-navy-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-navy-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-5 border-t border-slatebg-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importColumns.map((col) => {
              const currentMapping = mappings[col] || '';
              const fieldInfo = systemFields.find(f => f.value === currentMapping);
              const isUsedElsewhere = currentMapping && usedFields.filter(f => f === currentMapping).length > 1;

              return (
                <div
                  key={col}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    fieldInfo?.required
                      ? currentMapping
                        ? 'border-success-200 bg-success-50/40'
                        : 'border-warning-200 bg-warning-50/40'
                      : 'border-slatebg-200 bg-slatebg-50/30',
                    isUsedElsewhere && 'border-danger-300 bg-danger-50/50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white border border-slatebg-200 text-navy-600 truncate max-w-full">
                      {col}
                    </span>
                    {fieldInfo?.required && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-100 text-success-700 font-medium">
                        必填
                      </span>
                    )}
                    {isUsedElsewhere && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger-100 text-danger-700 font-medium">
                        重复映射
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-navy-400 shrink-0">→</span>
                    <Select
                      value={currentMapping}
                      onChange={(val) => onMappingChange(col, val)}
                      options={options}
                      placeholder="选择系统字段"
                      className="flex-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMappingSection;
