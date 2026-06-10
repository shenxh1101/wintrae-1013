import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Users,
  ClipboardList,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepItem {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: StepItem[] = [
  {
    id: 0,
    title: '名单导入',
    description: '导入员工名单并校验数据',
    icon: Upload,
  },
  {
    id: 1,
    title: '模板填充',
    description: '选择并生成入职文档',
    icon: FileText,
  },
  {
    id: 2,
    title: '账号清单',
    description: '配置各部门开通事项',
    icon: Users,
  },
  {
    id: 3,
    title: '任务分派',
    description: '分派任务给负责人',
    icon: ClipboardList,
  },
  {
    id: 4,
    title: '结果核对',
    description: '确认完成并归档',
    icon: CheckCircle,
  },
];

const stepRoutes = ['import', 'templates', 'accounts', 'tasks', 'review'];

interface StepNavigationProps {
  currentStep: number;
  batchId: string;
  onStepChange?: (step: number) => void;
}

export default function StepNavigation({
  currentStep,
  batchId,
  onStepChange,
}: StepNavigationProps) {
  const navigate = useNavigate();
  const [confirmStep, setConfirmStep] = useState<number | null>(null);

  const handleStepClick = (step: number) => {
    if (step === currentStep) return;
    if (step > currentStep) {
      setConfirmStep(step);
      return;
    }
    navigate(`/batches/${batchId}/${stepRoutes[step]}`);
    onStepChange?.(step);
  };

  const handleConfirm = () => {
    if (confirmStep !== null) {
      navigate(`/batches/${batchId}/${stepRoutes[confirmStep]}`);
      onStepChange?.(confirmStep);
      setConfirmStep(null);
    }
  };

  return (
    <div className="relative py-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isPending = step.id > currentStep;
        const isLast = index === steps.length - 1;
        const showConfirm = confirmStep === step.id;

        return (
          <div key={step.id} className="relative">
            <div
              onClick={() => handleStepClick(step.id)}
              className={cn(
                'relative flex items-start gap-4 py-4 pr-4 cursor-pointer group',
                isCompleted && 'cursor-pointer',
                isPending && 'cursor-pointer'
              )}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 z-10',
                    isCompleted && 'bg-success-500 text-white shadow-lg shadow-success-200',
                    isCurrent && cn(
                      'bg-navy-800 text-white shadow-lg shadow-navy-200 animate-pulse-glow'
                    ),
                    isPending &&
                      'bg-white border-2 border-slatebg-200 text-navy-400 group-hover:border-navy-300',
                    showConfirm && 'ring-2 ring-warning-400 ring-offset-2'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {!isLast && (
                  <div className="absolute top-12 w-0.5 flex-1 min-h-[48px]">
                    <div
                      className={cn(
                        'w-full h-full transition-all duration-500',
                        isCompleted ? 'bg-success-400' : 'border-l-2 border-dashed border-slatebg-200'
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div
                  className={cn(
                    'flex items-center gap-2 mb-1',
                    isPending && 'opacity-60'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider',
                      isCompleted && 'text-success-600',
                      isCurrent && 'text-copper-500',
                      isPending && 'text-navy-400'
                    )}
                  >
                    步骤 {step.id + 1}
                  </span>
                </div>
                <h4
                  className={cn(
                    'font-semibold text-base transition-colors',
                    isCompleted && 'text-navy-700',
                    isCurrent && 'text-navy-900',
                    isPending && 'text-navy-500'
                  )}
                >
                  {step.title}
                </h4>
                <p
                  className={cn(
                    'text-sm mt-1',
                    isCompleted && 'text-navy-500',
                    isCurrent && 'text-navy-600',
                    isPending && 'text-navy-400'
                  )}
                >
                  {step.description}
                </p>

                {showConfirm && (
                  <div className="mt-3 p-3 bg-warning-50 rounded-xl border border-warning-200 animate-slide-in">
                    <p className="text-sm text-warning-800 font-medium mb-2">
                      ⚠️ 跳转到未完成步骤
                    </p>
                    <p className="text-xs text-warning-700 mb-3">
                      当前步骤尚未完成，确定要跳转吗？之前的进度不会丢失。
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmStep(null);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-warning-300 text-warning-700 hover:bg-warning-100"
                      >
                        取消
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm();
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-warning-500 text-white hover:bg-warning-600"
                      >
                        确认跳转
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
