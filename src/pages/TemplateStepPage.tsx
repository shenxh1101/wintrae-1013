import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, FileText, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { BatchStepLayout } from '@/components/layout';
import { useBatchStore, useTemplateStore, useUIStore } from '@/stores';
import { Button, Modal, Badge } from '@/components/common';
import { cn } from '@/lib/utils';
import TemplateCard from './template/TemplateCard';
import GenerateProgress from './template/GenerateProgress';
import DownloadSection from './template/DownloadSection';
import type { Employee, DocumentTemplate } from '@/types';

const fieldLabels: Record<string, string> = {
  name: '姓名',
  position: '岗位',
  joinDate: '入职日期',
  departmentName: '部门',
  phone: '手机号',
  email: '邮箱',
  idCard: '身份证',
  managerName: '部门主管',
  workstation: '工位',
};

const TemplateStepPage: React.FC = () => {
  const { batchId = '' } = useParams<{ batchId: string }>();
  const { employees, setCurrentBatch } = useBatchStore();
  const { templates, selectedTemplateIds, toggleTemplate, clearSelection, generateDocuments, generatedDocs } = useTemplateStore();
  const { showToast, setLoading } = useUIStore();

  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (batchId) {
      setCurrentBatch(batchId);
    }
  }, [batchId, setCurrentBatch]);

  const batchEmployees = useMemo(() => {
    return employees.filter((e) => e.batchId === batchId);
  }, [employees, batchId]);

  const selectedTemplates = useMemo(() => {
    return templates.filter((t) => selectedTemplateIds.includes(t.id));
  }, [templates, selectedTemplateIds]);

  const batchGeneratedDocs = useMemo(() => {
    return generatedDocs.filter((d) => d.batchId === batchId);
  }, [generatedDocs, batchId]);

  const totalDocs = selectedTemplates.length * batchEmployees.length;

  useEffect(() => {
    if (batchGeneratedDocs.length > 0) {
      setCompletedCount(batchGeneratedDocs.length);
      const total = selectedTemplateIds.length > 0
        ? selectedTemplateIds.length * batchEmployees.length
        : batchGeneratedDocs.length;
      setProgress(total > 0 ? (batchGeneratedDocs.length / total) * 100 : 0);
    }
  }, [batchGeneratedDocs.length, selectedTemplateIds.length, batchEmployees.length]);

  const handleGenerate = async () => {
    if (selectedTemplates.length === 0) {
      showToast('请先选择至少一个文档模板', 'warning');
      return;
    }
    if (batchEmployees.length === 0) {
      showToast('当前批次没有员工数据，请先返回导入', 'warning');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCompletedCount(0);
    setFailedCount(0);
    setLoading(true);

    const total = totalDocs;
    let processed = 0;

    try {
      for (const employee of batchEmployees) {
        setCurrentEmployee(employee);
        for (let i = 0; i < selectedTemplates.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          processed++;
          setCompletedCount(processed);
          setProgress((processed / total) * 100);
        }
      }

      await generateDocuments(batchId, batchEmployees);
      setCompletedCount(processed);
      setProgress(100);
      showToast(`成功生成 ${processed} 份文档`, 'success');
    } catch (_err) {
      setFailedCount((prev) => prev + 1);
      showToast('文档生成过程中出现错误', 'error');
    } finally {
      setIsGenerating(false);
      setLoading(false);
      setCurrentEmployee(null);
    }
  };

  const handleStepChange = (step: number) => {
    if (step > 1 && batchGeneratedDocs.length === 0 && selectedTemplates.length === 0) {
      showToast('请选择模板并生成文档后再继续', 'warning');
      return;
    }
  };

  const renderPreviewContent = (template: DocumentTemplate) => {
    const sampleEmp = batchEmployees[0] || {
      name: '张三',
      position: '高级工程师',
      joinDate: '2026-06-15',
      departmentName: '技术部',
      idCard: '110101199001011234',
      phone: '13800138000',
      email: 'zhangsan@company.com',
      managerName: '李经理',
    };

    let content = template.contentTemplate;
    Object.entries(sampleEmp).forEach(([key, value]) => {
      if (typeof value === 'string') {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    });

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-800">预览模式</p>
            <p className="text-xs text-warning-700">以下为使用示例数据填充的文档效果，正式生成时将使用真实员工数据</p>
          </div>
        </div>
        <div className="border border-slatebg-200 rounded-xl p-8 bg-gradient-to-br from-white to-slatebg-50/30 min-h-[400px] shadow-inner">
          <div
            className="prose prose-sm max-w-none text-navy-800"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        <div className="p-4 rounded-lg bg-slatebg-50 border border-slatebg-200">
          <p className="text-xs font-semibold text-navy-700 mb-2">模板所需字段：</p>
          <div className="flex flex-wrap gap-2">
            {template.requiredFields.map((f) => (
              <Badge key={f} variant="info" size="sm">
                {fieldLabels[f] || f}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <BatchStepLayout batchId={batchId} currentStep={1} onStepChange={handleStepChange}>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="p-5 rounded-2xl border border-slatebg-200 bg-gradient-to-r from-navy-50/60 via-white to-copper-50/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-600 to-copper-500 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-navy-800 font-serif">已选择</h2>
                <span className="px-3 py-1 rounded-full bg-navy-600 text-white text-sm font-bold">
                  {batchEmployees.length}
                </span>
                <span className="text-navy-700">名员工</span>
                <span className="text-navy-400 mx-1">·</span>
                <span className="text-sm text-navy-600">请选择需要生成的文档模板</span>
              </div>
              <p className="text-sm text-navy-500 mt-1">
                系统将自动把员工信息填入模板，批量生成入职所需的各类文档
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slatebg-200 shadow-sm">
              <FileText className="w-5 h-5 text-navy-500" />
              <div className="text-left">
                <p className="text-xs text-navy-500">预计生成</p>
                <p className="text-lg font-bold text-navy-800">
                  {totalDocs} <span className="text-sm font-normal text-navy-500">份文档</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-copper-500 to-copper-400 rounded-full" />
                <h3 className="text-base font-semibold text-navy-800 font-serif">文档模板库</h3>
                <span className="px-2 py-0.5 rounded-full bg-slatebg-100 text-navy-600 text-xs font-medium">
                  共 {templates.length} 个模板
                </span>
              </div>
              {selectedTemplates.length > 0 && (
                <button
                  onClick={() => {
                    clearSelection();
                    showToast('已清除选择', 'info');
                  }}
                  className="text-sm text-navy-500 hover:text-danger-600 transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  清除选择
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateIds.includes(template.id)}
                  onToggle={() => toggleTemplate(template.id)}
                  onPreview={() => setPreviewTemplate(template)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="sticky top-6 space-y-4">
              <div className="p-5 rounded-2xl border border-slatebg-200 bg-white shadow-sm">
                <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-navy-600" />
                  </div>
                  生成配置
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slatebg-50/70 border border-slatebg-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-navy-600">已选模板</span>
                      <span className={cn(
                        'text-sm font-bold',
                        selectedTemplates.length > 0 ? 'text-navy-800' : 'text-navy-400'
                      )}>
                        {selectedTemplates.length} 个
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTemplates.length === 0 ? (
                        <span className="text-xs text-navy-400 italic">请从左侧选择模板</span>
                      ) : (
                        selectedTemplates.map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-navy-200 text-xs text-navy-700"
                          >
                            <CheckCircle2 className="w-3 h-3 text-success-500" />
                            {t.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-copper-50/50 border border-navy-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-navy-500">将生成文档总数</p>
                        <p className="text-3xl font-bold text-navy-800 font-serif mt-0.5">
                          {totalDocs}
                          <span className="text-sm font-normal text-navy-500 ml-1">份</span>
                        </p>
                      </div>
                      <div className="text-right text-xs text-navy-500">
                        <p>{selectedTemplates.length} 模板</p>
                        <p>× {batchEmployees.length} 员工</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    leftIcon={<Sparkles className="w-5 h-5" />}
                    onClick={handleGenerate}
                    disabled={selectedTemplates.length === 0 || isGenerating}
                    loading={isGenerating}
                  >
                    {isGenerating ? '正在生成...' : '生成全部文档'}
                  </Button>

                  {selectedTemplates.length === 0 && (
                    <p className="text-xs text-warning-600 text-center flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      请先选择至少一个文档模板
                    </p>
                  )}
                </div>
              </div>

              {(isGenerating || batchGeneratedDocs.length > 0) && (
                <GenerateProgress
                  progress={progress}
                  total={totalDocs || batchGeneratedDocs.length}
                  completed={completedCount || batchGeneratedDocs.length}
                  failed={failedCount}
                  currentEmployee={currentEmployee}
                  isGenerating={isGenerating}
                />
              )}
            </div>
          </div>
        </div>

        {batchGeneratedDocs.length > 0 && (
          <DownloadSection
            documents={batchGeneratedDocs}
            employees={batchEmployees}
          />
        )}

        <Modal
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={
            previewTemplate ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy-500 to-copper-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-navy-800">{previewTemplate.name}</h3>
                  <p className="text-xs text-navy-500 font-normal">文档预览</p>
                </div>
              </div>
            ) : undefined
          }
          size="lg"
          footer={
            previewTemplate ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewTemplate(null)}
                >
                  关闭预览
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => {
                    if (previewTemplate && !selectedTemplateIds.includes(previewTemplate.id)) {
                      toggleTemplate(previewTemplate.id);
                    }
                    setPreviewTemplate(null);
                    showToast(`已选择「${previewTemplate.name}」模板`, 'success');
                  }}
                >
                  选择此模板
                </Button>
              </>
            ) : undefined
          }
        >
          {previewTemplate && renderPreviewContent(previewTemplate)}
        </Modal>
      </div>
    </BatchStepLayout>
  );
};

export default TemplateStepPage;
