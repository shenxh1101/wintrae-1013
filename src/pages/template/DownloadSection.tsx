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

const generateTemplateSpecificContent = (templateName: string, employee: Employee): string => {
  switch (templateName) {
    case '劳动合同':
      return `
        <div style="margin-top:40px">
          <h2 style="color:#1e3a5f;font-size:18px;margin-bottom:20px">主要条款</h2>
          <div style="line-height:2;color:#333;font-size:14px">
            <p>一、劳动合同期限：自 ${employee.joinDate} 起，试用期 3 个月。</p>
            <p>二、工作岗位：${employee.position}</p>
            <p>三、工作地点：公司总部及业务相关场所</p>
            <p>四、工作时间：标准工时制，每周工作不超过 40 小时</p>
            <p>五、劳动报酬：按月支付，具体金额详见薪酬通知单</p>
            <p>六、社会保险：公司按国家规定为员工缴纳各项社会保险</p>
          </div>
        </div>`;
    case '保密协议':
      return `
        <div style="margin-top:40px">
          <h2 style="color:#1e3a5f;font-size:18px;margin-bottom:20px">保密内容</h2>
          <div style="line-height:2;color:#333;font-size:14px">
            <p>一、技术信息：包括但不限于技术方案、工程设计、软件代码等</p>
            <p>二、经营信息：包括但不限于客户名单、营销策略、财务数据等</p>
            <p>三、保密期限：在职期间及离职后两年内</p>
            <p>四、违约责任：违反保密义务应承担相应法律责任</p>
          </div>
        </div>`;
    case '竞业限制协议':
      return `
        <div style="margin-top:40px">
          <h2 style="color:#1e3a5f;font-size:18px;margin-bottom:20px">竞业限制条款</h2>
          <div style="line-height:2;color:#333;font-size:14px">
            <p>一、限制范围：不得在与公司有竞争关系的单位任职</p>
            <p>二、限制期限：离职后 12 个月内</p>
            <p>三、限制地域：公司业务覆盖的主要城市</p>
            <p>四、补偿金：公司按月支付竞业限制补偿金</p>
          </div>
        </div>`;
    case '设备领用单':
      return `
        <div style="margin-top:40px">
          <h2 style="color:#1e3a5f;font-size:18px;margin-bottom:20px">设备清单</h2>
          <table class="info-table">
            <tr><td>笔记本电脑</td><td>1 台</td></tr>
            <tr><td>显示器</td><td>1 台</td></tr>
            <tr><td>键盘鼠标</td><td>1 套</td></tr>
            <tr><td>办公文具</td><td>1 套</td></tr>
          </table>
        </div>`;
    case '入职须知':
      return `
        <div style="margin-top:40px">
          <h2 style="color:#1e3a5f;font-size:18px;margin-bottom:20px">入职须知</h2>
          <div style="line-height:2;color:#333;font-size:14px">
            <p>一、请于 ${employee.joinDate} 上午 9:00 到人事部报到</p>
            <p>二、报到时请携带身份证、学历证书原件</p>
            <p>三、办公地点：${employee.workstation || '详见工位安排'}</p>
            <p>四、如有疑问请联系部门主管：${employee.managerName || '人事部'}</p>
          </div>
        </div>`;
    default:
      return '';
  }
};

const downloadFile = (htmlContent: string, filename: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const generateDocumentHtml = (doc: GeneratedDocument, employee: Employee, templateName: string) => {
  return `
<html>
<head>
  <meta charset="utf-8">
  <title>${templateName}</title>
  <style>
    body { font-family: "Microsoft YaHei", sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; color: #1e3a5f; border-bottom: 2px solid #d4a574; padding-bottom: 20px; }
    .info-table { width: 100%; margin-top: 30px; border-collapse: collapse; }
    .info-table td { padding: 12px 16px; border: 1px solid #e0e0e0; }
    .info-table td:first-child { background: #f5f7fa; width: 120px; font-weight: bold; color: #1e3a5f; }
    .sign-section { margin-top: 80px; display: flex; justify-content: space-between; }
    .sign-box { text-align: center; }
    .sign-line { width: 150px; border-bottom: 1px solid #333; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${templateName}</h1>
  <div style="margin-top:20px;color:#666">合同编号：${doc.id.slice(0, 12).toUpperCase()}</div>
  <table class="info-table">
    <tr><td>姓名</td><td>${employee.name}</td></tr>
    <tr><td>岗位</td><td>${employee.position}</td></tr>
    <tr><td>入职日期</td><td>${employee.joinDate}</td></tr>
    <tr><td>部门</td><td>${employee.departmentName}</td></tr>
    <tr><td>邮箱</td><td>${employee.email || '—'}</td></tr>
    <tr><td>手机号</td><td>${employee.phone || '—'}</td></tr>
  </table>
  ${generateTemplateSpecificContent(templateName, employee)}
  <div class="sign-section">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div>员工签字</div>
      <div style="margin-top:4px;font-size:12px;color:#999">日期：</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div>公司盖章</div>
      <div style="margin-top:4px;font-size:12px;color:#999">日期：</div>
    </div>
  </div>
</body>
</html>`;
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

  const handleDownloadSingle = (doc: GeneratedDocument) => {
    const employee = employees.find((e) => e.id === doc.employeeId);
    if (!employee) return;
    const templateName = doc.templateName;
    const htmlContent = generateDocumentHtml(doc, employee, templateName);
    const filename = `${employee.name}_${templateName}.html`;
    downloadFile(htmlContent, filename);
  };

  const handleDownloadEmployee = (empId: string) => {
    const empDocs = docsByEmployee[empId];
    const employee = employees.find((e) => e.id === empId);
    if (!employee || !empDocs) return;
    empDocs.forEach((doc, index) => {
      setTimeout(() => {
        const templateName = doc.templateName;
        const htmlContent = generateDocumentHtml(doc, employee, templateName);
        const filename = `${employee.name}_${templateName}.html`;
        downloadFile(htmlContent, filename);
      }, index * 500);
    });
  };

  const handleDownloadAll = () => {
    let index = 0;
    documents.forEach((doc) => {
      const employee = employees.find((e) => e.id === doc.employeeId);
      if (employee) {
        setTimeout(() => {
          const templateName = doc.templateName;
          const htmlContent = generateDocumentHtml(doc, employee, templateName);
          const filename = `${employee.name}_${templateName}.html`;
          downloadFile(htmlContent, filename);
        }, index * 400);
        index++;
      }
    });
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
