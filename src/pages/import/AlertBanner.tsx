import React from 'react';
import { AlertTriangle, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

interface MissingFieldItem {
  employeeId: string;
  employeeName: string;
  fields: string[];
}

interface AlertBannerProps {
  missingFields: MissingFieldItem[];
  onLocate: (employeeId: string) => void;
  onDismiss?: () => void;
  className?: string;
}

const fieldLabels: Record<string, string> = {
  name: '姓名',
  position: '岗位',
  joinDate: '入职日期',
  departmentName: '部门',
  phone: '手机号',
  email: '邮箱',
  idCard: '身份证',
};

const AlertBanner: React.FC<AlertBannerProps> = ({
  missingFields,
  onLocate,
  onDismiss,
  className,
}) => {
  if (missingFields.length === 0) return null;

  const totalMissing = missingFields.reduce((sum, item) => sum + item.fields.length, 0);
  const firstItem = missingFields[0];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-danger-200 bg-gradient-to-r from-danger-50 via-danger-100/80 to-danger-50 shadow-sm animate-slide-in',
        className
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-danger-500" />
      <div className="p-4 pr-12">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger-500 flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-danger-800">
                发现缺失字段
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-danger-200 text-danger-700 text-xs font-medium">
                {missingFields.length} 名员工 · {totalMissing} 项缺失
              </span>
            </div>
            <p className="text-sm text-danger-700 mb-3">
              以下员工信息存在缺失，补录后即可进入下一步：
            </p>
            <div className="flex flex-wrap gap-2">
              {missingFields.slice(0, 5).map((item) => (
                <button
                  key={item.employeeId}
                  onClick={() => onLocate(item.employeeId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 border border-danger-200 hover:bg-white hover:border-danger-400 transition-all text-sm group"
                >
                  <span className="font-medium text-navy-800">{item.employeeName}</span>
                  <span className="text-danger-600">
                    {item.fields.map(f => fieldLabels[f] || f).join('、')}
                  </span>
                  <Target className="w-3.5 h-3.5 text-danger-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {missingFields.length > 5 && (
                <span className="px-3 py-1.5 text-sm text-danger-600 font-medium">
                  还有 {missingFields.length - 5} 名员工...
                </span>
              )}
            </div>
            {firstItem && (
              <div className="mt-4">
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Target className="w-4 h-4" />}
                  onClick={() => onLocate(firstItem.employeeId)}
                >
                  一键定位缺失项
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-danger-400 hover:text-danger-600 hover:bg-white/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
