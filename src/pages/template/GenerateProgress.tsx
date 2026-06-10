import React from 'react';
import { CheckCircle2, XCircle, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/common';
import type { Employee } from '@/types';

interface GenerateProgressProps {
  progress: number;
  total: number;
  completed: number;
  failed: number;
  currentEmployee?: Employee | null;
  isGenerating: boolean;
  className?: string;
}

const GenerateProgress: React.FC<GenerateProgressProps> = ({
  progress,
  total,
  completed,
  failed,
  currentEmployee,
  isGenerating,
  className,
}) => {
  if (!isGenerating && total === 0) return null;

  const successCount = completed - failed;

  return (
    <div
      className={cn(
        'p-5 rounded-2xl border bg-white shadow-sm animate-slide-in',
        isGenerating ? 'border-navy-200 bg-gradient-to-br from-navy-50/50 to-white' : 'border-success-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            isGenerating
              ? 'bg-navy-100 animate-pulse'
              : failed > 0
              ? 'bg-warning-100'
              : 'bg-success-100'
          )}>
            {isGenerating ? (
              <Clock className="w-5 h-5 text-navy-600 animate-spin" />
            ) : failed > 0 ? (
              <XCircle className="w-5 h-5 text-warning-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-success-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-navy-800">
              {isGenerating ? '正在生成文档...' : '文档生成完成'}
            </h3>
            <p className="text-sm text-navy-500">
              共 {total} 份文档 · 已完成 {completed}/{total}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 border border-success-200">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            <span className="text-sm font-semibold text-success-700">{successCount}</span>
            <span className="text-xs text-success-600">成功</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-50 border border-danger-200">
            <XCircle className="w-4 h-4 text-danger-600" />
            <span className="text-sm font-semibold text-danger-700">{failed}</span>
            <span className="text-xs text-danger-600">失败</span>
          </div>
        </div>
      </div>

      <ProgressBar
        value={progress}
        showPercentage
        animated={isGenerating}
        className="mb-4"
      />

      {isGenerating && currentEmployee && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-50/50 border border-navy-100 animate-slide-in">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-500 to-copper-500 flex items-center justify-center text-white font-medium text-sm shrink-0">
            {currentEmployee.name ? currentEmployee.name[0] : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-800 truncate">
              正在处理：{currentEmployee.name || '未知员工'}
            </p>
            <p className="text-xs text-navy-500 truncate">
              {currentEmployee.position} · {currentEmployee.departmentName}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4 text-navy-400" />
            <span className="text-xs text-navy-500">生成中...</span>
          </div>
        </div>
      )}

      {!isGenerating && total > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 border border-success-100">
          <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" />
          <p className="text-sm text-success-700">
            {failed === 0
              ? `全部 ${total} 份文档生成成功，可在下方下载`
              : `已完成 ${successCount} 份，${failed} 份生成失败，请重试`}
          </p>
        </div>
      )}
    </div>
  );
};

export default GenerateProgress;
