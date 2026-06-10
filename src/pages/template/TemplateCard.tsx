import React from 'react';
import { Check, Eye, Shield, FileCheck, Briefcase, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, Button } from '@/components/common';
import type { DocumentTemplate, DocumentCategory } from '@/types';

interface TemplateCardProps {
  template: DocumentTemplate;
  isSelected: boolean;
  onToggle: () => void;
  onPreview: () => void;
}

const categoryConfig: Record<DocumentCategory, { label: string; variant: 'success' | 'info' | 'warning' | 'neutral'; Icon: React.FC<{ className?: string }>; gradient: string }> = {
  contract: {
    label: '劳动合同',
    variant: 'success',
    Icon: FileCheck,
    gradient: 'from-success-500 to-success-600',
  },
  agreement: {
    label: '协议文书',
    variant: 'info',
    Icon: Shield,
    gradient: 'from-info-500 to-navy-600',
  },
  equipment: {
    label: '设备单据',
    variant: 'warning',
    Icon: Briefcase,
    gradient: 'from-copper-500 to-warning-500',
  },
  other: {
    label: '其他文档',
    variant: 'neutral',
    Icon: HelpCircle,
    gradient: 'from-navy-400 to-navy-500',
  },
};

const fieldLabels: Record<string, string> = {
  name: '姓名',
  position: '岗位',
  joinDate: '入职日期',
  departmentName: '部门',
  phone: '手机号',
  email: '邮箱',
  idCard: '身份证',
  managerName: '部门主管',
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onToggle,
  onPreview,
}) => {
  const config = categoryConfig[template.category];
  const CategoryIcon = config.Icon;

  return (
    <div
      onClick={onToggle}
      className={cn(
        'relative rounded-2xl border-2 bg-white cursor-pointer transition-all duration-300 overflow-hidden group',
        'hover:scale-[1.02] hover:shadow-xl',
        isSelected
          ? 'border-navy-600 shadow-lg shadow-navy-200/50 bg-navy-50/40'
          : 'border-slatebg-200 hover:border-navy-300'
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center shadow-md animate-slide-in">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn(
        'relative h-32 bg-gradient-to-br flex items-center justify-center overflow-hidden',
        config.gradient
      )}>
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-12 -translate-x-12" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <CategoryIcon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={cn(
            'font-semibold text-navy-900 truncate',
            isSelected && 'text-navy-800'
          )}>
            {template.name}
          </h3>
        </div>

        <div className="mb-3">
          <Badge variant={config.variant} size="sm">
            {config.label}
          </Badge>
        </div>

        <p className="text-sm text-navy-500 line-clamp-2 mb-3 min-h-[40px]">
          {template.description}
        </p>

        <div className="border-t border-slatebg-100 pt-3">
          <p className="text-xs text-navy-400 mb-2 font-medium">所需字段：</p>
          <div className="flex flex-wrap gap-1.5">
            {template.requiredFields.slice(0, 4).map((field) => (
              <span
                key={field}
                className={cn(
                  'inline-flex items-center px-1.5 py-0.5 text-xs rounded-md',
                  'bg-slatebg-100 text-navy-600 border border-slatebg-200'
                )}
              >
                {fieldLabels[field] || field}
              </span>
            ))}
            {template.requiredFields.length > 4 && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-xs rounded-md bg-slatebg-100 text-navy-500 border border-slatebg-200">
                +{template.requiredFields.length - 4}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant={isSelected ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSelected ? '已选择' : '选择模板'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            预览
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
