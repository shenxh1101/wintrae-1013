import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit3, AlertTriangle, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type { Employee } from '@/types';

interface DataPreviewTableProps {
  employees: Employee[];
  onUpdateEmployee: (id: string, data: Partial<Employee>) => void;
  onAddEmployee: () => void;
  onDeleteEmployee: (id: string) => void;
  scrollToEmployeeId?: string | null;
  className?: string;
}

interface ColumnDef {
  key: keyof Employee | 'index' | 'actions';
  label: string;
  editable: boolean;
  width: string;
  required?: boolean;
}

const columns: ColumnDef[] = [
  { key: 'index', label: '序号', editable: false, width: 'w-16' },
  { key: 'name', label: '姓名', editable: true, width: 'w-28', required: true },
  { key: 'position', label: '岗位', editable: true, width: 'w-36', required: true },
  { key: 'joinDate', label: '入职日期', editable: true, width: 'w-32', required: true },
  { key: 'departmentName', label: '部门', editable: true, width: 'w-28', required: true },
  { key: 'phone', label: '手机号', editable: true, width: 'w-32' },
  { key: 'email', label: '邮箱', editable: true, width: 'w-48' },
  { key: 'idCard', label: '身份证', editable: true, width: 'w-44' },
  { key: 'actions', label: '操作', editable: false, width: 'w-24' },
];

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  employees,
  onUpdateEmployee,
  onAddEmployee,
  onDeleteEmployee,
  scrollToEmployeeId,
  className,
}) => {
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollToEmployeeId && rowRefs.current.has(scrollToEmployeeId)) {
      const row = rowRefs.current.get(scrollToEmployeeId);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row?.classList.add('ring-2', 'ring-warning-400', 'bg-warning-50/50');
      setTimeout(() => {
        row?.classList.remove('ring-2', 'ring-warning-400', 'bg-warning-50/50');
      }, 3000);
    }
  }, [scrollToEmployeeId]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleDoubleClick = (employee: Employee, key: string) => {
    setEditingCell({ id: employee.id, key });
    setEditValue(String((employee as unknown as Record<string, unknown>)[key] || ''));
  };

  const handleSaveEdit = () => {
    if (editingCell) {
      onUpdateEmployee(editingCell.id, { [editingCell.key]: editValue });
      setEditingCell(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  const isMissingField = (employee: Employee, key: string) => {
    return employee._missingFields?.includes(key);
  };

  const renderCellContent = (employee: Employee, col: ColumnDef, index: number) => {
    if (col.key === 'index') {
      return <span className="font-medium text-navy-500">{index + 1}</span>;
    }

    if (col.key === 'actions') {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const firstEditableCol = columns.find(c => c.editable);
              if (firstEditableCol) {
                handleDoubleClick(employee, firstEditableCol.key as string);
              }
            }}
            className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors"
            title="编辑"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteEmployee(employee.id)}
            className="p-1.5 rounded-lg text-navy-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    }

    const isEditing = editingCell?.id === employee.id && editingCell?.key === col.key;
    const value = (employee as unknown as Record<string, unknown>)[col.key] as string;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type={col.key === 'joinDate' ? 'date' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 rounded-md border border-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
          />
          <button onClick={handleSaveEdit} className="p-1 text-success-600 hover:bg-success-50 rounded">
            <Save className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleCancelEdit} className="p-1 text-danger-600 hover:bg-danger-50 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    const isMissing = isMissingField(employee, col.key as string);

    return (
      <div
        onDoubleClick={() => col.editable && handleDoubleClick(employee, col.key as string)}
        className={cn(
          'relative px-1 -mx-1 py-0.5 rounded transition-colors',
          col.editable && 'cursor-pointer hover:bg-navy-50',
          isMissing && 'bg-danger-100/60 rounded-md'
        )}
      >
        <span className={cn(
          value ? 'text-navy-800' : 'text-navy-300 italic',
          isMissing && 'text-danger-700'
        )}>
          {value || '—'}
        </span>
        {isMissing && (
          <span className="absolute -top-0.5 -right-0.5 w-0 h-0 border-t-[10px] border-t-warning-500 border-l-[10px] border-l-transparent" />
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-navy-800">数据预览</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-700 text-sm font-medium">
            共 {employees.length} 条记录
          </span>
          {employees.some(e => e._missingFields && e._missingFields.length > 0) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-danger-100 text-danger-700 text-sm font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {employees.filter(e => e._missingFields && e._missingFields.length > 0).length} 条待补录
            </span>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onAddEmployee}
        >
          添加一行
        </Button>
      </div>

      <div className="border border-slatebg-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slatebg-50 border-b border-slatebg-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left font-semibold text-navy-700 whitespace-nowrap',
                      col.width
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.required && <span className="text-danger-500">*</span>}
                      {col.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-navy-400">
                    <div className="flex flex-col items-center gap-2">
                      <Edit3 className="w-12 h-12 text-navy-200" />
                      <p>暂无数据，请上传文件或点击"添加一行"手动录入</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => {
                  const hasMissing = employee._missingFields && employee._missingFields.length > 0;
                  return (
                    <tr
                      key={employee.id}
                      ref={(el) => {
                        if (el) rowRefs.current.set(employee.id, el);
                      }}
                      className={cn(
                        'border-b border-slatebg-100 transition-colors',
                        index % 2 === 0 ? 'bg-white' : 'bg-slatebg-50/30',
                        hasMissing && 'hover:bg-danger-50/30',
                        'hover:bg-navy-50/40'
                      )}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-2.5 whitespace-nowrap align-middle',
                            col.width
                          )}
                        >
                          {renderCellContent(employee, col, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-navy-500">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-danger-100 border border-danger-200 flex items-center justify-center">
            <span className="w-0 h-0 border-t-[6px] border-t-warning-500 border-l-[6px] border-l-transparent" />
          </span>
          <span>缺失必填字段</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>双击单元格可编辑</span>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewTable;
