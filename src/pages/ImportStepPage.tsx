import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BatchStepLayout } from '@/components/layout';
import { useBatchStore, useUIStore } from '@/stores';
import { cn } from '@/lib/utils';
import FileUploader from './import/FileUploader';
import AlertBanner from './import/AlertBanner';
import DataPreviewTable from './import/DataPreviewTable';
import FieldMappingSection from './import/FieldMappingSection';
import type { Employee, MissingFieldAlert } from '@/types';

const fieldNameMappings: Record<string, string[]> = {
  name: ['姓名', 'name', '员工姓名', 'Name'],
  position: ['岗位', 'position', '职位', 'job', 'Job Title', '职务'],
  joinDate: ['入职日期', 'joinDate', '入职时间', '到岗日期', 'start date', 'Start Date'],
  departmentName: ['部门', 'departmentName', 'department', '所属部门', 'Department'],
  phone: ['手机号', 'phone', 'mobile', '联系电话', 'Phone', '电话号码'],
  email: ['邮箱', 'email', 'E-mail', '电子邮箱', '邮件'],
  idCard: ['身份证', 'idCard', '身份证号', 'ID Card', '身份证号码'],
  gender: ['性别', 'gender', 'Sex'],
  managerName: ['部门主管', 'managerName', '主管', '直属领导'],
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const ImportStepPage: React.FC = () => {
  const { batchId = '' } = useParams<{ batchId: string }>();
  const { employees, importEmployees, updateEmployee, setCurrentBatch } = useBatchStore();
  const { showToast } = useUIStore();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importColumns, setImportColumns] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [scrollToEmployeeId, setScrollToEmployeeId] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (batchId) {
      setCurrentBatch(batchId);
    }
  }, [batchId, setCurrentBatch]);

  const batchEmployees = useMemo(() => {
    return employees.filter((e) => e.batchId === batchId);
  }, [employees, batchId]);

  const missingFieldAlerts: MissingFieldAlert[] = useMemo(() => {
    return batchEmployees
      .filter((e) => e._missingFields && e._missingFields.length > 0)
      .map((e) => ({
        employeeId: e.id,
        employeeName: e.name || '未命名员工',
        fields: e._missingFields || [],
      }));
  }, [batchEmployees]);

  const isValid = missingFieldAlerts.length === 0 && batchEmployees.length > 0;

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    showToast(`文件 "${file.name}" 已选择，正在解析...`, 'info');

    const sampleColumns = ['姓名', '岗位', '入职日期', '部门', '手机号', '邮箱', '身份证'];
    setImportColumns(sampleColumns);

    const defaultMappings: Record<string, string> = {};
    sampleColumns.forEach((col) => {
      for (const [systemField, aliases] of Object.entries(fieldNameMappings)) {
        if (aliases.some((a) => a.toLowerCase() === col.toLowerCase())) {
          defaultMappings[col] = systemField;
          break;
        }
      }
    });
    setFieldMappings(defaultMappings);

    const mockEmployees: Partial<Employee>[] = [
      { name: '王浩然', position: '高级前端工程师', joinDate: '2026-06-15', departmentName: '技术部', phone: '13700137101', email: 'wanghaoran@company.com', idCard: '110101199503151234' },
      { name: '李思琪', position: 'Java后端工程师', joinDate: '2026-06-15', departmentName: '技术部', email: 'lisiqi@company.com', idCard: '310101199608204567' },
      { name: '张嘉怡', position: '市场推广专员', joinDate: '2026-06-15', departmentName: '市场部', email: 'zhangjiayi@company.com' },
    ];

    setTimeout(() => {
      importEmployees(batchId, mockEmployees);
      showToast(`成功导入 ${mockEmployees.length} 条员工记录`, 'success');
    }, 800);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setImportColumns([]);
    setFieldMappings({});
    showToast('已移除文件', 'info');
  };

  const handleDownloadTemplate = () => {
    showToast('Excel模板下载中...', 'info');
    setTimeout(() => showToast('模板已下载到本地', 'success'), 1000);
  };

  const handleMappingChange = (importCol: string, systemField: string) => {
    setFieldMappings((prev) => ({ ...prev, [importCol]: systemField }));
  };

  const handleAutoMap = () => {
    const mappings: Record<string, string> = {};
    const usedFields = new Set<string>();

    importColumns.forEach((col) => {
      for (const [systemField, aliases] of Object.entries(fieldNameMappings)) {
        if (!usedFields.has(systemField) && aliases.some((a) => a.toLowerCase() === col.toLowerCase())) {
          mappings[col] = systemField;
          usedFields.add(systemField);
          break;
        }
      }
    });

    setFieldMappings(mappings);
    showToast('智能匹配完成，请检查映射结果', 'success');
  };

  const handleLocateEmployee = (employeeId: string) => {
    setScrollToEmployeeId(employeeId);
    setTimeout(() => setScrollToEmployeeId(null), 100);
    const emp = batchEmployees.find((e) => e.id === employeeId);
    if (emp) {
      showToast(`已定位到 ${emp.name || '该员工'} 的缺失字段`, 'info');
    }
  };

  const handleAddEmployee = () => {
    const newEmployee: Partial<Employee> = {
      id: generateId('emp'),
      name: '',
      position: '',
      joinDate: new Date().toISOString().split('T')[0],
      departmentName: '',
    };
    importEmployees(batchId, [newEmployee]);
    showToast('已添加新员工，请填写信息', 'info');
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = batchEmployees.find((e) => e.id === id);
    useBatchStore.setState((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    }));
    showToast(`已删除 ${emp?.name || '员工'}`, 'info');
  };

  const handleStepChange = (step: number) => {
    if (step > 0 && !isValid) {
      if (batchEmployees.length === 0) {
        showToast('请先导入或添加员工信息', 'warning');
        return;
      }
      showToast(`仍有 ${missingFieldAlerts.length} 名员工缺失必填字段，请先补录`, 'warning');
      return;
    }
  };

  return (
    <BatchStepLayout batchId={batchId} currentStep={0} onStepChange={handleStepChange}>
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className={cn('lg:col-span-3 transition-all duration-500', uploadedFile && 'lg:col-span-2')}>
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-copper-500 to-copper-400 rounded-full" />
                <h2 className="text-lg font-semibold text-navy-800 font-serif">名单导入</h2>
              </div>
              <div className="flex-1">
                <FileUploader
                  onFileSelect={handleFileSelect}
                  uploadedFile={uploadedFile}
                  onRemoveFile={handleRemoveFile}
                  onDownloadTemplate={handleDownloadTemplate}
                />
              </div>
            </div>
          </div>

          <div className={cn('lg:col-span-2 transition-all duration-500', !uploadedFile && 'opacity-50 pointer-events-none')}>
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-danger-500 to-danger-400 rounded-full" />
                <h2 className="text-lg font-semibold text-navy-800 font-serif">数据质量检查</h2>
              </div>
              <div className="flex-1">
                {showBanner && (
                  <AlertBanner
                    missingFields={missingFieldAlerts}
                    onLocate={handleLocateEmployee}
                    onDismiss={() => setShowBanner(false)}
                  />
                )}
                {missingFieldAlerts.length === 0 && batchEmployees.length > 0 && (
                  <div className="p-6 rounded-xl border border-success-200 bg-gradient-to-r from-success-50 to-success-50/50 animate-slide-in">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-success-500 flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-success-800">数据校验通过</h4>
                        <p className="text-sm text-success-700">共 {batchEmployees.length} 名员工信息已完整，可进入下一步</p>
                      </div>
                    </div>
                  </div>
                )}
                {batchEmployees.length === 0 && (
                  <div className="p-6 rounded-xl border border-slatebg-200 bg-slatebg-50/50">
                    <div className="text-center text-navy-400">
                      <p className="text-sm">导入文件后将显示数据质量检查结果</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {importColumns.length > 0 && (
          <FieldMappingSection
            importColumns={importColumns}
            mappings={fieldMappings}
            onMappingChange={handleMappingChange}
            onAutoMap={handleAutoMap}
          />
        )}

        <DataPreviewTable
          employees={batchEmployees}
          onUpdateEmployee={updateEmployee}
          onAddEmployee={handleAddEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          scrollToEmployeeId={scrollToEmployeeId}
        />

        {!isValid && batchEmployees.length > 0 && (
          <div className="p-4 rounded-xl border border-warning-200 bg-warning-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-warning-800">
                还有 <span className="font-bold">{missingFieldAlerts.length}</span> 名员工缺失必填字段，请补录后再继续
              </p>
            </div>
            {missingFieldAlerts[0] && (
              <button
                onClick={() => handleLocateEmployee(missingFieldAlerts[0].employeeId)}
                className="px-4 py-2 rounded-lg bg-warning-500 text-white text-sm font-medium hover:bg-warning-600 transition-colors shadow-sm"
              >
                立即补录
              </button>
            )}
          </div>
        )}
      </div>
    </BatchStepLayout>
  );
};

export default ImportStepPage;
