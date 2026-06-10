import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Users as UsersIcon, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBatchStore, useUIStore } from '@/stores';
import { Badge, ProgressBar, Button } from '@/components/common';
import StepNavigation from './StepNavigation';
import type { BatchStatus } from '@/types';
import type { ReactNode } from 'react';

interface BatchStepLayoutProps {
  batchId: string;
  currentStep: number;
  children: ReactNode;
  onStepChange?: (step: number) => void;
}

const statusConfig: Record<BatchStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: '草稿', variant: 'neutral' },
  importing: { label: '导入中', variant: 'info' },
  processing: { label: '处理中', variant: 'warning' },
  in_progress: { label: '进行中', variant: 'info' },
  completed: { label: '已完成', variant: 'success' },
  archived: { label: '已归档', variant: 'warning' },
};

const stepTitles = [
  '名单导入',
  '模板填充',
  '账号清单',
  '任务分派',
  '结果核对',
];

export default function BatchStepLayout({
  batchId,
  currentStep,
  children,
  onStepChange,
}: BatchStepLayoutProps) {
  const { batches, updateBatch } = useBatchStore();
  const { showToast } = useUIStore();

  const batch = useMemo(() => {
    return batches.find((b) => b.id === batchId);
  }, [batches, batchId]);

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      onStepChange?.(nextStep);
      updateBatch(batchId, {
        currentStep: nextStep,
        status: nextStep === 4 ? 'in_progress' : batch?.status,
      });
      showToast(`已进入「${stepTitles[nextStep]}」步骤`, 'success');
    }
  };

  const handleStepChange = (step: number) => {
    onStepChange?.(step);
    updateBatch(batchId, { currentStep: step });
  };

  if (!batch) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-danger-100 flex items-center justify-center">
            <UsersIcon className="w-8 h-8 text-danger-500" />
          </div>
          <h3 className="text-lg font-semibold text-navy-800 mb-2">批次不存在</h3>
          <p className="text-sm text-navy-500">未找到ID为 {batchId.slice(0, 12)}... 的批次</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[batch.status];
  const progressPercent = batch.progressPercent || ((currentStep + 1) / 5) * 100;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slatebg-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slatebg-100 bg-gradient-to-r from-white via-slatebg-50 to-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-serif text-xl font-bold text-navy-900 truncate">
                  {batch.name}
                </h1>
                <Badge variant={status.variant} size="md">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full mr-1.5',
                    batch.status === 'completed' && 'bg-success-500',
                    batch.status === 'in_progress' && 'bg-navy-500 animate-pulse',
                    batch.status === 'importing' && 'bg-info-500 animate-pulse',
                    batch.status === 'draft' && 'bg-navy-400',
                  )} />
                  {status.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5 text-navy-600">
                  <Calendar className="w-4 h-4 text-copper-500" />
                  <span>入职日期:</span>
                  <span className="font-medium text-navy-800">{batch.startDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-navy-600">
                  <UsersIcon className="w-4 h-4 text-copper-500" />
                  <span>员工人数:</span>
                  <span className="font-semibold text-navy-800">{batch.employeeCount}</span>
                  <span className="text-navy-400">人</span>
                </div>
                {batch.totalTaskCount > 0 && (
                  <div className="flex items-center gap-1.5 text-navy-600">
                    <ChevronRight className="w-4 h-4 text-copper-500" />
                    <span>任务进度:</span>
                    <span className="font-semibold text-success-600">{batch.completedTaskCount}</span>
                    <span className="text-navy-400">/</span>
                    <span className="font-medium text-navy-800">{batch.totalTaskCount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-navy-600 font-medium">
                  步骤 {currentStep + 1}/5 · {stepTitles[currentStep]}
                </span>
                <span className="font-bold text-navy-800">{Math.round(progressPercent)}%</span>
              </div>
              <ProgressBar
                value={progressPercent}
                variant="default"
                showPercentage={false}
                animated={true}
                className="shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-slatebg-50/50 border-b border-slatebg-100 overflow-x-auto">
          {stepTitles.map((title, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isActive && 'bg-navy-800 text-white shadow-sm',
                    isDone && 'bg-success-100 text-success-700',
                    !isActive && !isDone && 'bg-white text-navy-500 border border-slatebg-200'
                  )}
                >
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                      isActive && 'bg-white/20 text-white',
                      isDone && 'bg-success-500 text-white',
                      !isActive && !isDone && 'bg-slatebg-200 text-navy-500'
                    )}
                  >
                    {isDone ? '✓' : idx + 1}
                  </span>
                  {title}
                </div>
                {idx < stepTitles.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slatebg-300 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <aside className="flex-shrink-0 w-[280px] hidden lg:block">
          <div className="sticky top-24 bg-white rounded-2xl border border-slatebg-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-navy-800 uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1 h-5 bg-copper-500 rounded-full" />
              流程步骤
            </h3>
            <StepNavigation
              currentStep={currentStep}
              batchId={batchId}
              onStepChange={handleStepChange}
            />
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 bg-white rounded-2xl border border-slatebg-200 shadow-sm overflow-hidden min-h-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </div>
          </div>

          <div className="mt-5 bg-white rounded-2xl border border-slatebg-200 shadow-sm p-4 lg:p-5">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                上一步
              </Button>

              <div className="hidden sm:flex items-center gap-2 text-sm text-navy-500">
                <span className="font-medium text-navy-700">
                  {stepTitles[currentStep]}
                </span>
                <ChevronRight className="w-4 h-4" />
                <span>
                  {currentStep < 4 ? stepTitles[currentStep + 1] : '完成'}
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNext}
                disabled={currentStep === 4}
              >
                {currentStep === 4 ? '完成流程' : '下一步'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
