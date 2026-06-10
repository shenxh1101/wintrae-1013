import { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  ChevronDown, ChevronUp, Filter, CheckSquare, Square,
  FileText, Printer, Download, User, Mail, Building2,
  GripVertical, Check, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BatchStepLayout } from '@/components/layout';
import { Badge, Button, Modal, ProgressBar } from '@/components/common';
import { useBatchStore, useUIStore } from '@/stores';
import { accountItemConfigs } from '@/utils/mockData';
import type { AccountItem, AccountType, Employee, Department } from '@/types';

const ACCOUNT_TYPES: { type: AccountType; name: string; defaultOn: boolean }[] = [
  { type: 'email', name: '邮箱', defaultOn: true },
  { type: 'id_badge', name: '工牌', defaultOn: true },
  { type: 'access_card', name: '门禁', defaultOn: true },
  { type: 'vpn', name: 'VPN', defaultOn: false },
  { type: 'erp', name: 'ERP', defaultOn: false },
  { type: 'oa', name: 'OA', defaultOn: false },
  { type: 'other', name: '其他', defaultOn: false },
];

function StatusBadge({ status }: { status: AccountItem['status'] }) {
  const cfg = {
    pending: { variant: 'neutral' as const, label: '待开通' },
    applying: { variant: 'info' as const, label: '申请中' },
    completed: { variant: 'success' as const, label: '已完成' },
  };
  return <Badge variant={cfg[status].variant} size="sm">{cfg[status].label}</Badge>;
}

function AccountSwitch({ isOn, status, onClick }: { isOn: boolean; status: AccountItem['status']; onClick: () => void }) {
  const colors: Record<string, string> = {
    pending: 'bg-slate-200',
    applying: 'bg-info-400',
    completed: 'bg-success-500',
  };
  return (
    <button onClick={onClick} className={cn('relative w-11 h-6 rounded-full transition-all flex items-center px-0.5', isOn ? colors[status] : 'bg-slate-200')}>
      <span className={cn('w-5 h-5 bg-white rounded-full shadow-sm transition-all', isOn ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  );
}

export default function AccountsStepPage() {
  const { id: batchId } = useParams<{ id: string }>();
  const { employees } = useBatchStore();
  const { showToast } = useUIStore();
  const [deptFilter, setDeptFilter] = useState('all');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [accountItems, setAccountItems] = useState<AccountItem[]>([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDept, setPreviewDept] = useState<Department | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  if (!batchId) {
    return <Navigate to="/batches" replace />;
  }

  const batchEmployees = useMemo(() => employees.filter(e => e.batchId === batchId), [employees, batchId]);

  const deptOptions = useMemo(() => {
    const deptMap = new Map<string, Department>();
    batchEmployees.forEach(emp => {
      if (!deptMap.has(emp.departmentId)) {
        const deptEmps = batchEmployees.filter(e => e.departmentId === emp.departmentId);
        deptMap.set(emp.departmentId, {
          id: emp.departmentId,
          name: emp.departmentName,
          managerName: emp.managerName || '',
          managerEmail: '',
          employeeCount: deptEmps.length,
        });
      }
    });
    return Array.from(deptMap.values());
  }, [batchEmployees]);

  const generateDefaultAccountItems = (emps: Employee[]) => {
    const items: AccountItem[] = [];
    emps.forEach(emp => {
      ACCOUNT_TYPES.forEach(({ type, defaultOn }) => {
        const cfg = accountItemConfigs.find(c => c.type === type);
        const deptMatch = cfg ? cfg.defaultDepartments.includes(emp.departmentId) : true;
        const required = cfg ? cfg.defaultRequired : defaultOn;
        if (deptMatch) {
          items.push({
            id: `acc-${emp.id}-${type}`,
            employeeId: emp.id,
            type,
            typeName: cfg?.typeName || type,
            required,
            status: ['email', 'id_badge', 'access_card'].includes(type) ? 'completed' : 'pending',
            applicant: '孙志强',
            completedAt: ['email', 'id_badge', 'access_card'].includes(type) ? new Date().toISOString() : undefined,
          });
        }
      });
    });
    return items;
  };

  useEffect(() => {
    if (batchEmployees.length > 0 && accountItems.length === 0) {
      setAccountItems(generateDefaultAccountItems(batchEmployees));
    }
  }, [batchEmployees, accountItems.length]);

  const filteredEmployees = useMemo(() => {
    if (deptFilter === 'all') return batchEmployees;
    return batchEmployees.filter(e => e.departmentId === deptFilter || e.departmentName === deptFilter);
  }, [batchEmployees, deptFilter]);

  const employeesByDept = useMemo(() => {
    const map: Record<string, Employee[]> = {};
    filteredEmployees.forEach(emp => {
      if (!map[emp.departmentId]) map[emp.departmentId] = [];
      map[emp.departmentId].push(emp);
    });
    return map;
  }, [filteredEmployees]);

  const deptStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    deptOptions.forEach(d => {
      const deptEmps = batchEmployees.filter(e => e.departmentId === d.id);
      const deptItems = accountItems.filter(ai => deptEmps.some(e => e.id === ai.employeeId));
      stats[d.id] = { total: deptItems.length, completed: deptItems.filter(ai => ai.status === 'completed').length };
    });
    return stats;
  }, [batchEmployees, accountItems, deptOptions]);

  const empAccountsMap = useMemo(() => {
    const map: Record<string, Record<AccountType, AccountItem | undefined>> = {};
    filteredEmployees.forEach(emp => {
      map[emp.id] = {} as Record<AccountType, AccountItem | undefined>;
      ACCOUNT_TYPES.forEach(({ type }) => {
        map[emp.id][type] = accountItems.find(ai => ai.employeeId === emp.id && ai.type === type);
      });
    });
    return map;
  }, [filteredEmployees, accountItems]);

  const totalStats = useMemo(() => {
    return ACCOUNT_TYPES.map(({ type, name }) => {
      const typeItems = accountItems.filter(ai => ai.type === type);
      return { type, name, total: typeItems.length, completed: typeItems.filter(ai => ai.status === 'completed').length };
    });
  }, [accountItems]);

  const toggleSet = (set: Set<string>, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  const toggleAccountStatus = (empId: string, type: AccountType) => {
    setAccountItems(prev => {
      const existing = prev.find(ai => ai.employeeId === empId && ai.type === type);
      if (existing) {
        const cycle: Record<string, AccountItem['status']> = { pending: 'applying', applying: 'completed', completed: 'pending' };
        return prev.map(ai => ai.id === existing.id ? { ...ai, status: cycle[ai.status], completedAt: cycle[ai.status] === 'completed' ? new Date().toISOString() : undefined } : ai);
      }
      const cfg = accountItemConfigs.find(c => c.type === type);
      const newItem: AccountItem = { id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, employeeId: empId, type, typeName: cfg?.typeName || type, required: true, status: 'applying', applicant: '孙志强' };
      return [...prev, newItem];
    });
  };

  const handleSelectAll = () => { setSelectedAll(!selectedAll); showToast(selectedAll ? '已取消全选' : '已全选所有账号', 'info'); };
  const handleGenerate = (dept: Department) => { setPreviewDept(dept); setPreviewOpen(true); showToast(`正在生成${dept.name}开通申请单...`, 'success'); };
  const handlePrint = () => { showToast('已发送至打印队列', 'success'); setPreviewOpen(false); };
  const handleExportPDF = () => { showToast('申请单PDF已导出', 'success'); setPreviewOpen(false); };

  return (
    <BatchStepLayout batchId={batchId} currentStep={2}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slatebg-50 rounded-xl border border-slatebg-200">
              <Filter className="w-4 h-4 text-copper-500" />
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-transparent text-sm text-navy-700 outline-none cursor-pointer">
                <option value="all">全部部门</option>
                {deptOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button onClick={handleSelectAll} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-navy-700 hover:bg-slatebg-50 border border-slatebg-200 transition-colors">
              {selectedAll ? <CheckSquare className="w-4 h-4 text-navy-600" /> : <Square className="w-4 h-4 text-navy-400" />}
              {selectedAll ? '取消全选' : '全选'}
            </button>
          </div>
          <Button variant="primary" leftIcon={<FileText className="w-4 h-4" />}>生成开通申请单</Button>
        </div>

        <div className="space-y-3">
          {deptOptions.map(dept => {
            const deptEmps = employeesByDept[dept.id] || [];
            if (deptEmps.length === 0) return null;
            const isExpanded = expandedDepts.has(dept.id);
            const stats = deptStats[dept.id] || { total: 0, completed: 0 };
            return (
              <div key={dept.id} className="rounded-2xl border border-slatebg-200 overflow-hidden bg-white">
                <button onClick={() => setExpandedDepts(p => toggleSet(p, dept.id))} className="w-full px-5 py-4 flex items-center justify-between hover:bg-slatebg-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-copper-500" />
                      <span className="font-semibold text-navy-800 text-lg">{dept.name}</span>
                      <Badge variant="neutral" size="md">{deptEmps.length}人</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-navy-600">
                      <User className="w-4 h-4 text-navy-400" /><span>主管：</span><span className="font-medium text-navy-700">{dept.managerName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-navy-500">进度</span>
                      <span className="font-semibold text-success-600">{stats.completed}</span>
                      <span className="text-navy-400">/</span>
                      <span className="font-medium text-navy-700">{stats.total}</span>
                    </div>
                    <div className="w-24"><ProgressBar value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} variant="slim" /></div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-navy-400" /> : <ChevronDown className="w-5 h-5 text-navy-400" />}
                    <Button variant="secondary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />} onClick={e => { e.stopPropagation(); handleGenerate(dept); }} disabled={deptEmps.length === 0}>生成申请单</Button>
                  </div>
                </button>
                {isExpanded && deptEmps.length > 0 && (
                  <div className="border-t border-slatebg-100 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slatebg-50/50 text-xs text-navy-500 uppercase tracking-wider">
                          <th className="text-left px-5 py-3 font-medium">员工</th>
                          {ACCOUNT_TYPES.map(at => <th key={at.type} className="text-center px-3 py-3 font-medium">{at.name}</th>)}
                          <th className="text-center px-5 py-3 font-medium">状态</th>
                          <th className="px-3 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slatebg-100">
                        {deptEmps.map(emp => {
                          const isRowExpanded = expandedRows.has(emp.id);
                          const allStatuses = ACCOUNT_TYPES.map(at => empAccountsMap[emp.id]?.[at.type]?.status || 'pending');
                          const overallStatus = allStatuses.every(s => s === 'completed') ? 'completed' : allStatuses.some(s => s === 'applying') ? 'applying' : 'pending';
                          return (
                            <>
                              <tr key={emp.id} className="hover:bg-slatebg-50/30 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-500 to-copper-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">{emp.name[0]}</div>
                                    <div className="min-w-0">
                                      <div className="font-medium text-navy-800">{emp.name}</div>
                                      <div className="text-xs text-navy-500">{emp.position}</div>
                                    </div>
                                  </div>
                                </td>
                                {ACCOUNT_TYPES.map(at => {
                                  const acc = empAccountsMap[emp.id]?.[at.type];
                                  const status = acc?.status || 'pending';
                                  const isOn = acc?.required ?? at.defaultOn;
                                  return <td key={at.type} className="text-center px-3 py-3.5"><AccountSwitch isOn={isOn} status={status} onClick={() => toggleAccountStatus(emp.id, at.type)} /></td>;
                                })}
                                <td className="text-center px-5 py-3.5"><StatusBadge status={overallStatus} /></td>
                                <td className="px-3 py-3.5">
                                  <button onClick={() => setExpandedRows(p => toggleSet(p, emp.id))} className="p-1.5 rounded-lg hover:bg-slatebg-100 text-navy-400 hover:text-navy-700 transition-colors">
                                    <GripVertical className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                              {isRowExpanded && (
                                <tr className="bg-slatebg-50/50">
                                  <td colSpan={ACCOUNT_TYPES.length + 3} className="px-5 py-4">
                                    <div className="pl-12 flex flex-col gap-4">
                                      <div className="flex items-start gap-6">
                                        <div className="flex-1">
                                          <label className="block text-sm font-medium text-navy-700 mb-1.5">备注</label>
                                          <input type="text" value={remarks[emp.id] || ''} onChange={e => setRemarks(p => ({ ...p, [emp.id]: e.target.value }))} placeholder="填写账号开通备注信息..." className="w-full px-3 py-2 rounded-lg border border-slatebg-200 text-sm focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100" />
                                        </div>
                                        <div className="flex-1">
                                          <label className="block text-sm font-medium text-navy-700 mb-1.5">负责人</label>
                                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slatebg-200 bg-white">
                                            <Mail className="w-4 h-4 text-navy-400" />
                                            <span className="text-sm text-navy-700">{emp.managerName || '—'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slatebg-200 bg-gradient-to-r from-white via-slatebg-50/30 to-white p-5">
          <h4 className="text-sm font-semibold text-navy-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-copper-500 rounded-full" />开通进度汇总
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {totalStats.map(({ type, name, total, completed }) => (
              <div key={type} className="bg-white rounded-xl border border-slatebg-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-navy-700">{name}</span>
                  <span className="text-xs text-navy-500">{completed}/{total}</span>
                </div>
                <ProgressBar value={total > 0 ? (completed / total) * 100 : 0} variant="slim" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="账号开通申请单" size="lg" footer={<>
        <Button variant="ghost" onClick={() => setPreviewOpen(false)}>取消</Button>
        <Button variant="secondary" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>打印</Button>
        <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>导出PDF</Button>
      </>}>
        <div className="space-y-6">
          <div className="text-center border-b-2 border-dashed border-slatebg-200 pb-6">
            <h2 className="text-2xl font-bold text-navy-900 font-serif mb-2">账号开通申请单</h2>
            <p className="text-sm text-navy-500">ACCOUNT OPENING APPLICATION FORM</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-navy-500">申请部门：</span><span className="font-medium text-navy-800">{previewDept?.name}</span></div>
            <div><span className="text-navy-500">部门主管：</span><span className="font-medium text-navy-800">{previewDept?.managerName}</span></div>
            <div><span className="text-navy-500">申请日期：</span><span className="font-medium text-navy-800">{new Date().toLocaleDateString('zh-CN')}</span></div>
            <div><span className="text-navy-500">申请编号：</span><span className="font-medium text-navy-800">ACC-{Date.now().toString().slice(-8)}</span></div>
          </div>
          <div className="border border-slatebg-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slatebg-50 text-navy-600">
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">姓名</th>
                <th className="px-4 py-3 text-left font-medium">岗位</th>
                {ACCOUNT_TYPES.slice(0, 5).map(at => <th key={at.type} className="px-3 py-3 text-center font-medium">{at.name}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slatebg-100">
                {(employeesByDept[previewDept?.id || ''] || []).map((emp, idx) => (
                  <tr key={emp.id}>
                    <td className="px-4 py-3 text-navy-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-navy-800">{emp.name}</td>
                    <td className="px-4 py-3 text-navy-600">{emp.position}</td>
                    {ACCOUNT_TYPES.slice(0, 5).map(at => {
                      const acc = empAccountsMap[emp.id]?.[at.type];
                      const on = acc?.required ?? at.defaultOn;
                      return <td key={at.type} className="px-3 py-3 text-center">{on ? <Check className="w-4 h-4 text-success-500 mx-auto" /> : <Minus className="w-4 h-4 text-navy-300 mx-auto" />}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-4">
            <div className="text-center"><div className="h-20 border-b border-dashed border-slatebg-300 mb-2" /><p className="text-xs text-navy-500">申请人签字</p></div>
            <div className="text-center">
              <div className="h-20 border-b border-dashed border-slatebg-300 mb-2 relative">
                <div className="absolute right-0 bottom-2 w-16 h-16 opacity-30">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-copper-500">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                    <text x="50" y="55" textAnchor="middle" fontSize="10" fill="currentColor">公章</text>
                  </svg>
                </div>
              </div><p className="text-xs text-navy-500">部门盖章</p>
            </div>
            <div className="text-center"><div className="h-20 border-b border-dashed border-slatebg-300 mb-2" /><p className="text-xs text-navy-500">行政部审批</p></div>
          </div>
        </div>
      </Modal>
    </BatchStepLayout>
  );
}
