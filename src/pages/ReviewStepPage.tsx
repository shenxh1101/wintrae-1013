import { useState, useMemo } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  Mail,
  Download,
  ChevronDown,
  ChevronUp,
  MapPin,
  Eye,
  Users,
  ClipboardList,
  KeyRound,
  FolderKanban,
  BarChart3,
  FileSearch,
  X,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Card, Button, Badge, Modal } from '@/components/common';
import BatchStepLayout from '@/components/layout/BatchStepLayout';
import { useBatchStore, useTaskStore, useTemplateStore, useUIStore } from '@/stores';
import type { Task, Employee, GeneratedDocument } from '@/types';

const FIELD_LABELS: Record<string, string> = {
  name: '姓名',
  position: '岗位',
  joinDate: '入职日期',
  departmentName: '部门',
  phone: '手机号',
  email: '邮箱',
  idCard: '身份证号',
};

const STEP_ICONS = [ClipboardList, FileText, KeyRound, Users, BarChart3];

const stepTitles = ['名单导入', '模板填充', '账号清单', '任务分派', '结果核对'];
const stepRoutes = ['import', 'templates', 'accounts', 'tasks', 'review'];

export default function ReviewStepPage() {
  const navigate = useNavigate();
  const { id: batchId } = useParams<{ id: string }>();
  const { employees, batches } = useBatchStore();
  const { tasks } = useTaskStore();
  const { generatedDocs, templates } = useTemplateStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'missing' | 'docs'>('tasks');
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [docViewMode, setDocViewMode] = useState<'employee' | 'type'>('employee');
  const [showReportModal, setShowReportModal] = useState(false);

  if (!batchId) {
    return <Navigate to="/batches" replace />;
  }

  const batch = batches.find((b) => b.id === batchId);
  const batchEmployees = employees.filter((e) => e.batchId === batchId);
  const batchTasks = tasks.filter((t) => t.batchId === batchId);
  const batchDocs = generatedDocs.filter((d) => d.batchId === batchId);

  const { missingFieldAlerts, unfinishedTasks, unopenedAccounts } = useMemo(() => {
    const missingFieldAlerts = batchEmployees
      .filter((e) => e._missingFields && e._missingFields.length > 0)
      .map((e) => ({ employeeId: e.id, employeeName: e.name, fields: e._missingFields! }));

    const unfinishedTasks = batchTasks.filter((t) => t.status !== 'completed');

    const unopenedAccounts: { employeeId: string; employeeName: string; step: number }[] = [];
    batchEmployees.forEach((emp) => {
      if (!emp.email) {
        unopenedAccounts.push({ employeeId: emp.id, employeeName: emp.name, step: 2 });
      }
    });

    return { missingFieldAlerts, unfinishedTasks, unopenedAccounts };
  }, [batchEmployees, batchTasks]);

  const hasAlerts = missingFieldAlerts.length > 0 || unfinishedTasks.length > 0 || unopenedAccounts.length > 0;

  const overallCompletion = useMemo(() => {
    const total = batchTasks.length || 1;
    const completed = batchTasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / total) * 100);
  }, [batchTasks]);

  const stepCompletion = useMemo(() => {
    return [
      { label: '名单导入', done: batchEmployees.every((e) => !e._missingFields?.length), current: false },
      { label: '模板填充', done: batchDocs.length >= batchEmployees.length * templates.filter((t) => t.isSelected).length, current: false },
      { label: '账号清单', done: batchEmployees.every((e) => e.email), current: false },
      { label: '任务分派', done: batchTasks.every((t) => t.assigneeId), current: false },
      { label: '结果核对', done: batchTasks.every((t) => t.status === 'completed'), current: true },
    ];
  }, [batchEmployees, batchDocs, templates, batchTasks]);

  const taskStats = useMemo(() => {
    const now = new Date();
    return {
      completed: batchTasks.filter((t) => t.status === 'completed').length,
      inProgress: batchTasks.filter((t) => t.status === 'in_progress').length,
      pending: batchTasks.filter((t) => t.status === 'pending').length,
      overdue: batchTasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now).length,
    };
  }, [batchTasks]);

  const docStats = useMemo(() => {
    const expectedCount = batchEmployees.length * templates.filter((t) => t.isSelected || true).length;
    return {
      generated: batchDocs.length,
      notGenerated: Math.max(0, expectedCount - batchDocs.length),
    };
  }, [batchEmployees, batchDocs, templates]);

  const employeeTaskMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    batchEmployees.forEach((e) => (map[e.id] = []));
    batchTasks.forEach((t) => {
      t.employeeIds.forEach((eid) => {
        if (map[eid]) map[eid].push(t);
      });
    });
    return map;
  }, [batchEmployees, batchTasks]);

  const employeeStepProgress = useMemo(() => {
    return batchEmployees.map((emp) => {
      const empTasks = employeeTaskMap[emp.id] || [];
      const totalTasks = empTasks.length || 1;
      const completedTasks = empTasks.filter((t) => t.status === 'completed').length;
      const steps = [
        !emp._missingFields?.length,
        batchDocs.some((d) => d.employeeId === emp.id),
        !!emp.email,
        empTasks.every((t) => t.assigneeId),
        completedTasks === totalTasks,
      ];
      return { ...emp, steps, completedTasks, totalTasks };
    });
  }, [batchEmployees, employeeTaskMap, batchDocs]);

  const missingItems = useMemo(() => {
    const items: Array<{ type: string; employeeName: string; detail: string; step: number; employeeId: string }> = [];
    missingFieldAlerts.forEach((a) =>
      a.fields.forEach((f) =>
        items.push({
          type: '缺失字段',
          employeeName: a.employeeName,
          detail: `缺少${FIELD_LABELS[f] || f}`,
          step: 0,
          employeeId: a.employeeId,
        })
      )
    );
    unfinishedTasks.forEach((t) =>
      items.push({
        type: '未完成任务',
        employeeName: t.assigneeName,
        detail: `${t.title} (${t.status === 'overdue' ? '已逾期' : t.status === 'in_progress' ? '进行中' : '待处理'})`,
        step: 3,
        employeeId: t.employeeIds[0] || '',
      })
    );
    return items;
  }, [missingFieldAlerts, unfinishedTasks]);

  const docsByEmployee = useMemo(() => {
    const map: Record<string, GeneratedDocument[]> = {};
    batchDocs.forEach((d) => {
      if (!map[d.employeeId]) map[d.employeeId] = [];
      map[d.employeeId].push(d);
    });
    return map;
  }, [batchDocs]);

  const docsByType = useMemo(() => {
    const map: Record<string, GeneratedDocument[]> = {};
    batchDocs.forEach((d) => {
      if (!map[d.templateId]) map[d.templateId] = [];
      map[d.templateId].push(d);
    });
    return map;
  }, [batchDocs]);

  const toggleEmployee = (id: string) => {
    setExpandedEmployees((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleStepNavigate = (step: number) => {
    navigate(`/batches/${batchId}/${stepRoutes[step]}`);
  };

  const handleExportReport = () => {
    setShowReportModal(true);
  };

  const handleSendEmail = () => {
    showToast(`已向 ${batchEmployees.length} 位新员工发送入职提醒邮件`, 'success');
  };

  const handleArchive = () => {
    const allDone = batchTasks.every((t) => t.status === 'completed');
    if (!allDone) {
      showToast('请确保所有任务完成后再归档', 'warning');
      return;
    }
    showToast('批次归档成功', 'success');
  };

  const canArchive = batchTasks.length > 0 && batchTasks.every((t) => t.status === 'completed');

  const TABS = [
    { key: 'tasks' as const, label: '任务追踪', icon: ClipboardList },
    { key: 'missing' as const, label: '缺失项清单', icon: AlertTriangle },
    { key: 'docs' as const, label: '文档中心', icon: FileSearch },
  ];

  const ringData = [
    { name: '已完成', value: overallCompletion },
    { name: '未完成', value: 100 - overallCompletion },
  ];

  const RING_COLORS = ['#2d8659', '#dde4ee'];

  return (
    <BatchStepLayout batchId={batchId} currentStep={4}>
      <div className="space-y-6">
        {hasAlerts && (
          <div className="rounded-2xl border border-danger-200 bg-gradient-to-r from-danger-50 to-danger-100/50 p-5 animate-slide-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-danger-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-danger-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-danger-800 mb-3">发现以下待处理事项</h3>
                <div className="space-y-2">
                  {missingFieldAlerts.slice(0, 3).map((a) => (
                    <div key={a.employeeId} className="flex items-center justify-between gap-3 bg-white/70 rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0" />
                        <span className="text-sm text-navy-700 truncate">
                          <span className="font-medium">{a.employeeName}</span> 的信息不完整，缺少
                          <span className="text-danger-600"> {a.fields.map((f) => FIELD_LABELS[f] || f).join('、')} </span>
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleStepNavigate(0)}>立即处理</Button>
                    </div>
                  ))}
                  {unfinishedTasks.slice(0, 2).map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 bg-white/70 rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-4 h-4 text-warning-500 flex-shrink-0" />
                        <span className="text-sm text-navy-700 truncate">
                          任务 <span className="font-medium">{t.title}</span> 尚未完成，负责人：{t.assigneeName}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleStepNavigate(3)}>立即处理</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-navy-500 mb-2 font-medium">总完成率</p>
              <div className="w-36 h-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ringData}
                      innerRadius={50}
                      outerRadius={66}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {ringData.map((_, i) => (
                        <Cell key={i} fill={RING_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-navy-900 font-serif">{overallCompletion}</span>
                  <span className="text-sm text-navy-500">%</span>
                </div>
              </div>
              <p className="text-xs text-navy-400 mt-3">
                {batch?.completedTaskCount || 0} / {batch?.totalTaskCount || 0} 任务完成
              </p>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <p className="text-sm text-navy-500 mb-4 font-medium">步骤完成情况</p>
            <div className="grid grid-cols-5 gap-2">
              {stepCompletion.map((step, idx) => {
                const Icon = STEP_ICONS[idx];
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all',
                        step.done
                          ? 'bg-success-100 text-success-600'
                          : step.current
                          ? 'bg-navy-100 text-navy-600 animate-pulse-glow'
                          : 'bg-slatebg-100 text-navy-400'
                      )}
                    >
                      {step.done ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-medium text-navy-700">{step.label}</span>
                    <span
                      className={cn(
                        'text-xs mt-1',
                        step.done ? 'text-success-600' : step.current ? 'text-navy-600' : 'text-navy-400'
                      )}
                    >
                      {step.done ? '已完成' : step.current ? '进行中' : '未开始'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            {[
              { label: '已完成', count: taskStats.completed, color: 'success', icon: CheckCircle2 },
              { label: '进行中', count: taskStats.inProgress, color: 'info', icon: Clock },
              { label: '待处理', count: taskStats.pending, color: 'warning', icon: AlertCircle },
              { label: '逾期', count: taskStats.overdue, color: 'danger', icon: AlertTriangle },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={cn(
                    'rounded-xl p-3 border transition-all',
                    item.color === 'success' && 'bg-success-50 border-success-200',
                    item.color === 'info' && 'bg-info-50 border-info-200',
                    item.color === 'warning' && 'bg-warning-50 border-warning-200',
                    item.color === 'danger' && 'bg-danger-50 border-danger-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        item.color === 'success' && 'text-success-600',
                        item.color === 'info' && 'text-info-600',
                        item.color === 'warning' && 'text-warning-600',
                        item.color === 'danger' && 'text-danger-600'
                      )}
                    />
                    <span className="text-xs font-medium text-navy-600">{item.label}</span>
                  </div>
                  <p
                    className={cn(
                      'text-2xl font-bold font-serif',
                      item.color === 'success' && 'text-success-700',
                      item.color === 'info' && 'text-info-700',
                      item.color === 'warning' && 'text-warning-700',
                      item.color === 'danger' && 'text-danger-700'
                    )}
                  >
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-navy-500 font-medium">文档生成情况</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-success-600 font-medium">已生成 {docStats.generated} 份</span>
              <span className="text-navy-300">|</span>
              <span className="text-warning-600 font-medium">未生成 {docStats.notGenerated} 份</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-slatebg-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success-400 to-success-600 rounded-full transition-all duration-700"
                style={{ width: `${(docStats.generated / (docStats.generated + docStats.notGenerated || 1)) * 100}%` }}
              />
            </div>
            <Button variant="ghost" size="sm" rightIcon={<Download className="w-4 h-4" />}>
              批量下载
            </Button>
          </div>
        </Card>

        <div className="border-b border-slatebg-200">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px',
                    active
                      ? 'text-navy-800 border-navy-700 bg-navy-50/50'
                      : 'text-navy-500 border-transparent hover:text-navy-700 hover:bg-slatebg-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.key === 'missing' && missingItems.length > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-danger-100 text-danger-600">
                      {missingItems.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {employeeStepProgress.map((emp) => {
                const expanded = expandedEmployees.has(emp.id);
                const empTasks = employeeTaskMap[emp.id] || [];
                return (
                  <div key={emp.id} className="border border-slatebg-200 rounded-xl overflow-hidden transition-all hover:border-navy-200">
                    <button
                      onClick={() => toggleEmployee(emp.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 bg-white hover:bg-slatebg-50/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper-400 to-copper-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-navy-800">{emp.name}</span>
                          <Badge variant="neutral" size="sm">{emp.position}</Badge>
                          <Badge variant="info" size="sm">{emp.departmentName}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-navy-500">
                          <span>入职: {emp.joinDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {emp.steps.map((done, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-3 h-3 rounded-full transition-all',
                              done ? 'bg-success-500' : 'bg-slatebg-200'
                            )}
                          />
                        ))}
                      </div>
                      <div className="text-right flex-shrink-0 w-28">
                        <p className="text-xs text-navy-500 mb-1">负责人</p>
                        <p className="text-sm font-medium text-navy-700 truncate">
                          {empTasks[0]?.assigneeName || '-'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 w-24">
                        <p className="text-xs text-navy-500 mb-1">进度</p>
                        <p className="text-sm font-semibold text-navy-700">
                          {emp.completedTasks}/{emp.totalTasks}
                        </p>
                      </div>
                      {expanded ? (
                        <ChevronUp className="w-5 h-5 text-navy-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                      )}
                    </button>
                    {expanded && (
                      <div className="border-t border-slatebg-100 bg-slatebg-50/50 px-5 py-4 space-y-2 animate-slide-in">
                        {empTasks.map((t) => (
                          <div key={t.id} className="flex items-center justify-between gap-4 bg-white rounded-lg px-4 py-3 border border-slatebg-100">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center',
                                  t.status === 'completed' && 'bg-success-100',
                                  t.status === 'in_progress' && 'bg-info-100',
                                  t.status === 'pending' && 'bg-warning-100',
                                  t.status === 'overdue' && 'bg-danger-100'
                                )}
                              >
                                <CheckCircle2
                                  className={cn(
                                    'w-4 h-4',
                                    t.status === 'completed' && 'text-success-600',
                                    t.status === 'in_progress' && 'text-info-600',
                                    t.status === 'pending' && 'text-warning-600',
                                    t.status === 'overdue' && 'text-danger-600'
                                  )}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-navy-800 truncate">{t.title}</p>
                                <p className="text-xs text-navy-500">截止: {t.dueDate}</p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                t.status === 'completed' ? 'success' :
                                t.status === 'overdue' ? 'danger' :
                                t.status === 'in_progress' ? 'info' : 'warning'
                              }
                              size="sm"
                            >
                              {t.status === 'completed' ? '已完成' :
                               t.status === 'overdue' ? '已逾期' :
                               t.status === 'in_progress' ? '进行中' : '待处理'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'missing' && (
            <div className="border border-slatebg-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slatebg-50 border-b border-slatebg-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-navy-600">类型</th>
                    <th className="text-left px-5 py-3 font-medium text-navy-600">员工</th>
                    <th className="text-left px-5 py-3 font-medium text-navy-600">详情</th>
                    <th className="text-left px-5 py-3 font-medium text-navy-600">步骤</th>
                    <th className="text-right px-5 py-3 font-medium text-navy-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {missingItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-navy-400">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success-400" />
                        太棒了，暂无缺失项！
                      </td>
                    </tr>
                  ) : (
                    missingItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slatebg-100 hover:bg-slatebg-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <Badge variant={item.type === '缺失字段' ? 'warning' : 'danger'} size="sm">
                            {item.type}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 font-medium text-navy-800">{item.employeeName}</td>
                        <td className="px-5 py-4 text-navy-600">{item.detail}</td>
                        <td className="px-5 py-4 text-navy-500">{stepTitles[item.step]}</td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<MapPin className="w-4 h-4" />}
                            onClick={() => handleStepNavigate(item.step)}
                          >
                            定位处理
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slatebg-200 p-1 bg-slatebg-50">
                  <button
                    onClick={() => setDocViewMode('employee')}
                    className={cn(
                      'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                      docViewMode === 'employee' ? 'bg-white text-navy-800 shadow-sm' : 'text-navy-500 hover:text-navy-700'
                    )}
                  >
                    按员工查看
                  </button>
                  <button
                    onClick={() => setDocViewMode('type')}
                    className={cn(
                      'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                      docViewMode === 'type' ? 'bg-white text-navy-800 shadow-sm' : 'text-navy-500 hover:text-navy-700'
                    )}
                  >
                    按类型查看
                  </button>
                </div>
              </div>

              {docViewMode === 'employee' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {batchEmployees.map((emp) => (
                    <Card key={emp.id} hoverable>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper-400 to-copper-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy-800 truncate">{emp.name}</p>
                          <p className="text-xs text-navy-500">{emp.position} · {emp.departmentName}</p>
                        </div>
                        <Badge variant="success" size="sm">{docsByEmployee[emp.id]?.length || 0} 份</Badge>
                      </div>
                      <div className="space-y-2">
                        {(docsByEmployee[emp.id] || []).map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between gap-3 bg-slatebg-50 rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-navy-500 flex-shrink-0" />
                              <span className="text-sm text-navy-700 truncate">{doc.templateName}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button className="p-1.5 rounded-md hover:bg-white text-navy-500 hover:text-navy-700 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-md hover:bg-white text-navy-500 hover:text-navy-700 transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(docsByType).map(([tplId, docs]) => {
                    const tpl = templates.find((t) => t.id === tplId);
                    return (
                      <Card key={tplId} hoverable>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-600 flex items-center justify-center flex-shrink-0">
                            <FolderKanban className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy-800 truncate">{tpl?.name || '未知模板'}</p>
                            <p className="text-xs text-navy-500">{docs.length} 份文档</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full" rightIcon={<Download className="w-4 h-4" />}>
                          下载全部 ({docs.length})
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slatebg-100">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Users className="w-4 h-4 text-copper-500" />
            <span>本批次共 <span className="font-semibold text-navy-700">{batchEmployees.length}</span> 名员工</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="md" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportReport}>
              导出汇总报告
            </Button>
            <Button variant="secondary" size="md" leftIcon={<Mail className="w-4 h-4" />} onClick={handleSendEmail}>
              发送入职提醒邮件
            </Button>
            <Button
              variant={canArchive ? 'primary' : 'primary'}
              size="md"
              leftIcon={<Archive className="w-4 h-4" />}
              onClick={handleArchive}
              disabled={!canArchive}
            >
              完成批次归档
            </Button>
          </div>
        </div>
      </div>

      <Modal open={showReportModal} onClose={() => setShowReportModal(false)} title="入职批次汇总报告" size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setShowReportModal(false)}>
              <X className="w-4 h-4" />
              关闭
            </Button>
            <Button variant="secondary" size="md" leftIcon={<Download className="w-4 h-4" />}>
              导出 Excel
            </Button>
            <Button variant="primary" size="md" leftIcon={<FileText className="w-4 h-4" />}>
              下载 PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="border-b border-slatebg-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif text-xl font-bold text-navy-900">{batch?.name}</h4>
              <Badge variant="info" size="md">批次汇总</Badge>
            </div>
            <p className="text-sm text-navy-500">生成时间：{new Date().toLocaleString('zh-CN')}</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '员工总数', value: batchEmployees.length, color: 'navy' },
              { label: '任务总数', value: batchTasks.length, color: 'navy' },
              { label: '完成率', value: `${overallCompletion}%`, color: 'success' },
              { label: '文档数', value: batchDocs.length, color: 'navy' },
            ].map((s) => (
              <div key={s.label} className="bg-slatebg-50 rounded-xl p-4 text-center">
                <p
                  className={cn(
                    'text-2xl font-bold font-serif mb-1',
                    s.color === 'success' ? 'text-success-600' : 'text-navy-800'
                  )}
                >
                  {s.value}
                </p>
                <p className="text-xs text-navy-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <h5 className="font-semibold text-navy-800 mb-3 text-sm">员工进度明细</h5>
            <div className="border border-slatebg-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slatebg-50 border-b border-slatebg-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-navy-600">员工</th>
                    <th className="text-left px-4 py-2.5 font-medium text-navy-600">部门</th>
                    <th className="text-left px-4 py-2.5 font-medium text-navy-600">任务进度</th>
                    <th className="text-left px-4 py-2.5 font-medium text-navy-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeStepProgress.map((emp) => (
                    <tr key={emp.id} className="border-b border-slatebg-100 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-navy-800">{emp.name}</td>
                      <td className="px-4 py-2.5 text-navy-600">{emp.departmentName}</td>
                      <td className="px-4 py-2.5 text-navy-600">
                        {emp.completedTasks}/{emp.totalTasks}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant={emp.completedTasks === emp.totalTasks ? 'success' : emp.completedTasks > 0 ? 'info' : 'warning'}
                          size="sm"
                        >
                          {emp.completedTasks === emp.totalTasks ? '已完成' : emp.completedTasks > 0 ? '进行中' : '待处理'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </BatchStepLayout>
  );
}
