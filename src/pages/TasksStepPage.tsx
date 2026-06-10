import { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Plus, Settings, Sparkles, User, Calendar,
  Bell, Check, Trash2, Edit2, X, ChevronRight, Mail,
  Users, AlertCircle, Clock, CheckCircle2, CircleDot,
  ListTodo, Layers, Shield, Briefcase, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BatchStepLayout } from '@/components/layout';
import { Badge, Button, ProgressBar, Select, Input, Card } from '@/components/common';
import { useBatchStore, useTaskStore, useUIStore } from '@/stores';
import { mockTaskTemplates, mockUsers, mockDepartments } from '@/utils/mockData';
import type { TaskTemplate, TaskPriority, UserRole, Task, TaskStatus, Employee } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = { hr: 'HR', admin: '行政', manager: '主管' };
const ROLE_ICONS: Record<UserRole, typeof Shield> = { hr: Users, admin: Shield, manager: Briefcase };
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; variant: 'danger' | 'warning' | 'info' | 'neutral'; color: string }> = {
  urgent: { label: '紧急', variant: 'danger', color: 'bg-danger-500' },
  high: { label: '高', variant: 'warning', color: 'bg-warning-500' },
  medium: { label: '中', variant: 'info', color: 'bg-info-500' },
  low: { label: '低', variant: 'neutral', color: 'bg-navy-400' },
};
const TASK_STATUS_TABS: { key: string; label: string; icon: typeof Clock; status?: TaskStatus }[] = [
  { key: 'all', label: '全部', icon: ListTodo },
  { key: 'pending', label: '待处理', icon: Clock, status: 'pending' },
  { key: 'in_progress', label: '进行中', icon: CircleDot, status: 'in_progress' },
  { key: 'completed', label: '已完成', icon: CheckCircle2, status: 'completed' },
];

interface SortableTemplateCardProps {
  template: TaskTemplate;
  isSelected: boolean;
  onClick: () => void;
}

function SortableTemplateCard({ template, isSelected, onClick }: SortableTemplateCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: template.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const RoleIcon = ROLE_ICONS[template.defaultRole];
  const pCfg = PRIORITY_CONFIG[template.defaultPriority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'group relative bg-white rounded-xl border-2 p-4 cursor-pointer transition-all',
        isSelected ? 'border-navy-600 shadow-md shadow-navy-100 ring-2 ring-navy-100' : 'border-slatebg-200 hover:border-navy-300 hover:shadow-sm',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 p-1 rounded-md text-navy-300 hover:text-navy-600 hover:bg-slatebg-100 cursor-grab active:cursor-grabbing transition-colors shrink-0">
          <GripVertical className="w-4 h-4" />
        </button>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', pCfg.color + '/10')}>
          <Layers className={cn('w-5 h-5', pCfg.color.replace('bg-', 'text-'))} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h5 className="font-semibold text-navy-800 text-sm truncate">{template.name}</h5>
            <Badge variant={pCfg.variant} size="sm">{pCfg.label}</Badge>
          </div>
          <p className="text-xs text-navy-500 line-clamp-2 mb-2.5">{template.description}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slatebg-50 text-xs text-navy-600">
              <RoleIcon className="w-3 h-3" />{ROLE_LABELS[template.defaultRole]}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slatebg-50 text-xs text-navy-600">
              <Calendar className="w-3 h-3" />入职前{template.defaultDueDays}天
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotifyToggleProps {
  label: string;
  icon: typeof Bell;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function NotifyToggle({ label, icon: Icon, checked, onChange }: NotifyToggleProps) {
  return (
    <button onClick={() => onChange(!checked)} className={cn(
      'flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all w-full',
      checked ? 'bg-navy-50 border-navy-200 text-navy-800' : 'bg-white border-slatebg-200 text-navy-500 hover:border-navy-300'
    )}>
      <div className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0', checked ? 'bg-navy-600' : 'bg-slatebg-200')}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function TasksStepPage() {
  const { id: batchId } = useParams<{ id: string }>();
  const { employees } = useBatchStore();
  const { tasks, createTasksFromTemplates, updateTask, updateTaskStatus } = useTaskStore();
  const { showToast } = useUIStore();

  const [templates, setTemplates] = useState<TaskTemplate[]>(mockTaskTemplates);
  const [selectedTplId, setSelectedTplId] = useState<string | null>(mockTaskTemplates[0]?.id || null);
  const [activeTab, setActiveTab] = useState('all');
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeRoleFilter, setAssigneeRoleFilter] = useState<UserRole | 'all'>('all');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDays, setDueDays] = useState(2);
  const [scope, setScope] = useState<'all' | 'dept' | 'emp'>('all');
  const [scopeDeptIds, setScopeDeptIds] = useState<string[]>([]);
  const [notifyCreate, setNotifyCreate] = useState(true);
  const [notifyDue, setNotifyDue] = useState(true);
  const [notifyDone, setNotifyDone] = useState(false);

  if (!batchId) {
    return <Navigate to="/batches" replace />;
  }

  const batchEmployees = useMemo(() => employees.filter(e => e.batchId === batchId), [employees, batchId]);
  const batchTasks = useMemo(() => tasks.filter(t => t.batchId === batchId), [tasks, batchId]);

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return batchTasks;
    return batchTasks.filter(t => t.status === activeTab);
  }, [batchTasks, activeTab]);

  const selectedTpl = useMemo(() => templates.find(t => t.id === selectedTplId), [templates, selectedTplId]);

  const filteredUsers = useMemo(() => {
    if (assigneeRoleFilter === 'all') return mockUsers;
    return mockUsers.filter(u => u.role === assigneeRoleFilter);
  }, [assigneeRoleFilter]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setTemplates(prev => {
        const oldIdx = prev.findIndex(t => t.id === active.id);
        const newIdx = prev.findIndex(t => t.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const handleSelectTemplate = (tpl: TaskTemplate) => {
    setSelectedTplId(tpl.id);
    setTaskName(tpl.name);
    setTaskDesc(tpl.description);
    setPriority(tpl.defaultPriority);
    setDueDays(tpl.defaultDueDays);
    setAssigneeRoleFilter(tpl.defaultRole);
    const defaultUser = mockUsers.find(u => u.role === tpl.defaultRole);
    setAssigneeId(defaultUser?.id || '');
  };

  const handleAddCustom = () => {
    const newTpl: TaskTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: '自定义任务',
      description: '请填写任务描述',
      defaultRole: 'admin',
      defaultPriority: 'medium',
      defaultDueDays: 3,
    };
    setTemplates(prev => [...prev, newTpl]);
    handleSelectTemplate(newTpl);
    showToast('已添加自定义任务模板', 'success');
  };

  const getScopedEmployees = (): Employee[] => {
    if (scope === 'all') return batchEmployees;
    if (scope === 'dept') return batchEmployees.filter(e => scopeDeptIds.includes(e.departmentId));
    return batchEmployees;
  };

  const handleAssign = () => {
    if (!selectedTpl || !assigneeId) {
      showToast('请完善任务配置信息', 'warning');
      return;
    }
    const assignee = mockUsers.find(u => u.id === assigneeId);
    if (!assignee) return;
    const scopedEmps = getScopedEmployees();
    if (scopedEmps.length === 0) {
      showToast('适用员工数量不能为空', 'warning');
      return;
    }
    const created = createTasksFromTemplates(batchId, [{ ...selectedTpl, name: taskName, description: taskDesc, defaultPriority: priority, defaultDueDays: dueDays }], scopedEmps);
    if (created[0]) {
      updateTask(created[0].id, { assigneeId, assigneeName: assignee.name, assigneeRole: assignee.role });
    }
    showToast(`已分派任务「${taskName}」给 ${assignee.name}`, 'success');
  };

  const handleAutoAssign = () => {
    const created = createTasksFromTemplates(batchId, templates, batchEmployees);
    showToast(`已自动分派 ${created.length} 个任务`, 'success');
  };

  const toggleScopeDept = (deptId: string) => {
    setScopeDeptIds(prev => prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]);
  };

  const assigneeOptions = [
    { value: '', label: '请选择负责人' },
    ...filteredUsers.map(u => ({ value: u.id, label: `${u.name} (${ROLE_LABELS[u.role]})` })),
  ];
  const priorityOptions = (Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof PRIORITY_CONFIG[TaskPriority]][]).map(([k, v]) => ({ value: k, label: v.label }));
  const scopeOptions = [
    { value: 'all', label: '全部员工' },
    { value: 'dept', label: '按部门选择' },
    { value: 'emp', label: '按员工多选' },
  ];

  return (
    <BatchStepLayout batchId={batchId} currentStep={3}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-navy-700 hover:bg-slatebg-50 border border-slatebg-200 transition-colors">
              <Settings className="w-4 h-4 text-copper-500" />模板管理
            </button>
          </div>
          <Button variant="success" leftIcon={<Sparkles className="w-4 h-4" />} onClick={handleAutoAssign}>自动分派全部</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-copper-500 rounded-full" />任务模板
                <Badge variant="neutral" size="sm">{templates.length}</Badge>
              </h4>
              <button onClick={handleAddCustom} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-navy-600 hover:bg-navy-50 border border-navy-200 transition-colors">
                <Plus className="w-3.5 h-3.5" />自定义
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[400px]">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={templates.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {templates.map(tpl => (
                    <SortableTemplateCard
                      key={tpl.id}
                      template={tpl}
                      isSelected={selectedTplId === tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full">
              {selectedTpl ? (
                <div className="flex flex-col gap-5 h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', PRIORITY_CONFIG[priority].color + '/10')}>
                        <Layers className={cn('w-6 h-6', PRIORITY_CONFIG[priority].color.replace('bg-', 'text-'))} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-800">任务分派配置</h4>
                        <p className="text-xs text-navy-500">模板：{selectedTpl.name}</p>
                      </div>
                    </div>
                    <Badge variant={PRIORITY_CONFIG[priority].variant} size="md">{PRIORITY_CONFIG[priority].label}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input label="任务名称" value={taskName} onChange={e => setTaskName(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-navy-800 mb-1.5">任务描述</label>
                      <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-slatebg-200 text-sm focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-1.5">负责人角色筛选</label>
                      <div className="flex gap-1.5">
                        <button onClick={() => setAssigneeRoleFilter('all')} className={cn('flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors', assigneeRoleFilter === 'all' ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-600 border-slatebg-200 hover:border-navy-300')}>全部</button>
                        {(['hr', 'admin', 'manager'] as UserRole[]).map(r => (
                          <button key={r} onClick={() => setAssigneeRoleFilter(r)} className={cn('flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors', assigneeRoleFilter === r ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-600 border-slatebg-200 hover:border-navy-300')}>{ROLE_LABELS[r]}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Select label="负责人" options={assigneeOptions} value={assigneeId} onChange={setAssigneeId} searchable />
                    </div>
                    <div>
                      <Select label="优先级" options={priorityOptions} value={priority} onChange={v => setPriority(v as TaskPriority)} />
                    </div>
                    <div>
                      <Input label="截止日期（入职前N天）" type="number" value={dueDays.toString()} onChange={e => setDueDays(Number(e.target.value))} />
                    </div>
                    <div className="md:col-span-2">
                      <Select label="应用范围" options={scopeOptions} value={scope} onChange={v => setScope(v as typeof scope)} />
                    </div>
                    {scope === 'dept' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-navy-800 mb-1.5">选择部门</label>
                        <div className="flex flex-wrap gap-2">
                          {mockDepartments.map(d => (
                            <button key={d.id} onClick={() => toggleScopeDept(d.id)} className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                              scopeDeptIds.includes(d.id) ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-600 border-slatebg-200 hover:border-navy-300'
                            )}>
                              {scopeDeptIds.includes(d.id) && <Check className="w-3.5 h-3.5" />}
                              <Building2 className="w-3.5 h-3.5" />{d.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">通知设置</label>
                    <div className="grid grid-cols-3 gap-2">
                      <NotifyToggle label="创建时通知" icon={Bell} checked={notifyCreate} onChange={setNotifyCreate} />
                      <NotifyToggle label="截止前1天" icon={AlertCircle} checked={notifyDue} onChange={setNotifyDue} />
                      <NotifyToggle label="完成时通知" icon={Mail} checked={notifyDone} onChange={setNotifyDone} />
                    </div>
                  </div>

                  <div className="flex-1" />
                  <Button variant="primary" size="lg" leftIcon={<Check className="w-5 h-5" />} onClick={handleAssign} className="w-full">确认分派任务</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-navy-400">
                  <ListTodo className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm font-medium">请在左侧选择一个任务模板</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="rounded-2xl border border-slatebg-200 bg-white overflow-hidden">
          <div className="flex items-center gap-1 px-5 py-3 border-b border-slatebg-100 overflow-x-auto">
            {TASK_STATUS_TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.key ? 'bg-navy-800 text-white shadow-sm' : 'text-navy-600 hover:bg-slatebg-50'
              )}>
                <tab.icon className="w-4 h-4" />{tab.label}
                <span className={cn('px-1.5 py-0.5 rounded-md text-xs', activeTab === tab.key ? 'bg-white/20' : 'bg-slatebg-200 text-navy-500')}>
                  {tab.key === 'all' ? batchTasks.length : batchTasks.filter(t => t.status === tab.status).length}
                </span>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slatebg-50/50 text-xs text-navy-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">任务名称</th>
                  <th className="text-left px-5 py-3 font-medium">负责人</th>
                  <th className="text-center px-5 py-3 font-medium">员工数</th>
                  <th className="text-center px-5 py-3 font-medium">优先级</th>
                  <th className="text-left px-5 py-3 font-medium">截止日期</th>
                  <th className="text-left px-5 py-3 font-medium w-48">进度</th>
                  <th className="text-center px-5 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slatebg-100">
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center text-navy-400">
                    <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">暂无已分派任务</p>
                  </td></tr>
                ) : filteredTasks.map(task => {
                  const pCfg = PRIORITY_CONFIG[task.priority];
                  const progress = task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0;
                  const isEditing = editTaskId === task.id;
                  return (
                    <tr key={task.id} className="hover:bg-slatebg-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', pCfg.color + '/10')}>
                            <Layers className={cn('w-4 h-4', pCfg.color.replace('bg-', 'text-'))} />
                          </div>
                          {isEditing ? (
                            <input className="flex-1 px-2 py-1 rounded-md border border-navy-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-100" defaultValue={task.title} />
                          ) : (
                            <span className="font-medium text-navy-800 text-sm">{task.title}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-navy-500 to-copper-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">{task.assigneeName[0]}</div>
                          <div>
                            <div className="text-sm font-medium text-navy-800">{task.assigneeName}</div>
                            <div className="text-xs text-navy-500">{ROLE_LABELS[task.assigneeRole]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center"><span className="text-sm font-semibold text-navy-700">{task.employeeIds.length}</span></td>
                      <td className="px-5 py-3.5 text-center"><Badge variant={pCfg.variant} size="sm">{pCfg.label}</Badge></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-navy-600">
                          <Calendar className="w-3.5 h-3.5 text-navy-400" />{task.dueDate}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={progress} variant="slim" />
                          <span className="text-xs font-medium text-navy-600 whitespace-nowrap">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <button onClick={() => { setEditTaskId(null); showToast('已保存修改', 'success'); }} className="p-1.5 rounded-md text-success-600 hover:bg-success-50 transition-colors"><Check className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => setEditTaskId(task.id)} className="p-1.5 rounded-md text-navy-500 hover:bg-navy-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => { showToast('已删除任务', 'warning'); }} className="p-1.5 rounded-md text-danger-500 hover:bg-danger-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BatchStepLayout>
  );
}
