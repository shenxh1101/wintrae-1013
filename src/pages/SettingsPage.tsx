import { useState } from 'react';
import {
  Settings as SettingsIcon,
  ClipboardList,
  Bell,
  BookOpen,
  Building2,
  UserCog,
  ImagePlus,
  CalendarClock,
  UserPlus,
  Mail,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, Button, Badge, Input, Select } from '@/components/common';
import { useUIStore } from '@/stores';

type TabKey = 'general' | 'task' | 'notify' | 'dictionary';

const TABS = [
  { key: 'general' as const, label: '通用设置', icon: SettingsIcon },
  { key: 'task' as const, label: '任务默认配置', icon: ClipboardList },
  { key: 'notify' as const, label: '通知模板', icon: Bell },
  { key: 'dictionary' as const, label: '字段字典', icon: BookOpen },
];

const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: '技术部', manager: '张伟' },
  { id: 'dept-2', name: '市场部', manager: '李娜' },
  { id: 'dept-3', name: '人事部', manager: '王芳' },
];

const INITIAL_POSITIONS = [
  { id: 'pos-1', name: '前端工程师', dept: '技术部' },
  { id: 'pos-2', name: '后端工程师', dept: '技术部' },
  { id: 'pos-3', name: '产品经理', dept: '技术部' },
  { id: 'pos-4', name: '市场专员', dept: '市场部' },
];

const GUIDE_OPTIONS = [
  { value: 'hr-001', label: '王芳 (HR专员)' },
  { value: 'hr-002', label: '赵敏 (HR主管)' },
  { value: 'admin-001', label: '陈静 (行政)' },
];

interface NotifyTemplate {
  key: string;
  title: string;
  icon: typeof Mail;
  subject: string;
  content: string;
}

const INITIAL_NOTIFY_TEMPLATES: NotifyTemplate[] = [
  {
    key: 'assign',
    title: '任务分派通知',
    icon: UserPlus,
    subject: '【入职系统】您有新的入职任务待处理',
    content: '尊敬的 {{assigneeName}}：\n\n您被分配了以下入职任务：\n\n任务名称：{{taskTitle}}\n截止日期：{{dueDate}}\n涉及员工：{{employeeCount}}人\n\n请及时处理，谢谢！\n\nHR系统自动发送',
  },
  {
    key: 'deadline',
    title: '截止日期提醒',
    icon: AlertCircle,
    subject: '【入职系统】任务即将逾期提醒',
    content: '尊敬的 {{assigneeName}}：\n\n您有以下任务即将逾期：\n\n任务名称：{{taskTitle}}\n截止日期：{{dueDate}}\n剩余时间：{{remainHours}}小时\n\n请尽快完成！\n\nHR系统自动发送',
  },
  {
    key: 'complete',
    title: '任务完成通知',
    icon: CheckCircle2,
    subject: '【入职系统】任务已完成通知',
    content: '尊敬的 {{assigneeName}}：\n\n您负责的以下任务已完成：\n\n任务名称：{{taskTitle}}\n完成时间：{{completeTime}}\n\n感谢您的配合！\n\nHR系统自动发送',
  },
];

export default function SettingsPage() {
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const [companyName, setCompanyName] = useState('某某科技有限公司');
  const [defaultGuide, setDefaultGuide] = useState('hr-001');

  const [dueDays, setDueDays] = useState('3');
  const [autoAssign, setAutoAssign] = useState(true);

  const [notifyTemplates, setNotifyTemplates] = useState(INITIAL_NOTIFY_TEMPLATES);
  const [editingNotify, setEditingNotify] = useState<string | null>(null);

  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editingPos, setEditingPos] = useState<string | null>(null);
  const [deptInput, setDeptInput] = useState({ name: '', manager: '' });
  const [posInput, setPosInput] = useState({ name: '', dept: '' });

  const handleSaveGeneral = () => {
    showToast('通用设置已保存', 'success');
  };

  const handleSaveTask = () => {
    showToast('任务配置已保存', 'success');
  };

  const saveNotify = (key: string, field: 'subject' | 'content', value: string) => {
    setNotifyTemplates((prev) =>
      prev.map((t) => (t.key === key ? { ...t, [field]: value } : t))
    );
  };

  const handleSaveNotify = () => {
    setEditingNotify(null);
    showToast('通知模板已保存', 'success');
  };

  const addDepartment = () => {
    if (!deptInput.name.trim()) return;
    setDepartments((prev) => [
      ...prev,
      { id: `dept-${Date.now()}`, name: deptInput.name, manager: deptInput.manager || '待指定' },
    ]);
    setDeptInput({ name: '', manager: '' });
    showToast('部门已添加', 'success');
  };

  const removeDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    showToast('部门已删除', 'success');
  };

  const addPosition = () => {
    if (!posInput.name.trim()) return;
    setPositions((prev) => [
      ...prev,
      { id: `pos-${Date.now()}`, name: posInput.name, dept: posInput.dept || '未分类' },
    ]);
    setPosInput({ name: '', dept: '' });
    showToast('岗位已添加', 'success');
  };

  const removePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
    showToast('岗位已删除', 'success');
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy-900 mb-1">系统设置</h1>
        <p className="text-sm text-navy-500">配置系统参数、模板和字典数据</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <aside className="flex-shrink-0 w-56">
          <div className="bg-white rounded-2xl border border-slatebg-200 shadow-sm p-3 sticky top-24">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1',
                    active
                      ? 'bg-gradient-to-r from-navy-700 to-navy-800 text-white shadow-sm'
                      : 'text-navy-600 hover:bg-slatebg-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 min-w-0 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-5 max-w-2xl">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-copper-100 text-copper-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-navy-800">公司信息</h2>
                    <p className="text-xs text-navy-500">配置公司基础信息</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <Input
                    label="公司名称"
                    prefixIcon={<Building2 className="w-4 h-4" />}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <Select
                    label="默认入职引导人"
                    options={GUIDE_OPTIONS}
                    value={defaultGuide}
                    onChange={setDefaultGuide}
                    searchable
                  />
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5">公司 Logo</label>
                    <div className="border-2 border-dashed border-slatebg-200 rounded-xl p-8 bg-slatebg-50/50 hover:border-navy-300 hover:bg-navy-50/30 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slatebg-200 flex items-center justify-center mb-3 shadow-sm group-hover:border-navy-300 transition-all">
                          <ImagePlus className="w-6 h-6 text-navy-400 group-hover:text-navy-600" />
                        </div>
                        <p className="text-sm font-medium text-navy-700 mb-1">点击上传 Logo</p>
                        <p className="text-xs text-navy-400">支持 PNG / JPG / SVG，建议 200×60px</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-slatebg-100 flex justify-end">
                  <Button variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveGeneral}>
                    保存设置
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'task' && (
            <div className="space-y-5 max-w-2xl">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-info-100 text-info-600 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-navy-800">任务默认配置</h2>
                    <p className="text-xs text-navy-500">新任务创建时的默认参数</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-navy-800 mb-2">
                      <CalendarClock className="w-4 h-4 text-copper-500" />
                      默认截止日期偏移天数
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-40">
                        <Input
                          type="number"
                          value={dueDays}
                          onChange={(e) => setDueDays(e.target.value)}
                          min={1}
                          max={30}
                        />
                      </div>
                      <span className="text-sm text-navy-500">天后自动截止（相对于入职日期）</span>
                    </div>
                    <p className="text-xs text-navy-400 mt-2">建议值：1-7天，具体可按任务紧急程度调整</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-navy-800 mb-2">
                      <UserCog className="w-4 h-4 text-copper-500" />
                      自动分派规则
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoAssign(!autoAssign)}
                      className={cn(
                        'relative w-14 h-8 rounded-full transition-all',
                        autoAssign ? 'bg-navy-700' : 'bg-slatebg-200'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-md transition-all flex items-center justify-center',
                          autoAssign ? 'left-[26px]' : 'left-0.5'
                        )}
                      >
                        {autoAssign && <Check className="w-4 h-4 text-navy-700" />}
                      </div>
                    </button>
                    <p className="text-xs text-navy-500 mt-2">
                      {autoAssign
                        ? '已启用：创建任务时按角色自动分派给对应负责人'
                        : '已关闭：任务需要手动指定负责人'}
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-slatebg-100 flex justify-end">
                  <Button variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveTask}>
                    保存配置
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notify' && (
            <div className="space-y-5 max-w-3xl">
              {notifyTemplates.map((tpl) => {
                const Icon = tpl.icon;
                const isEditing = editingNotify === tpl.key;
                return (
                  <Card key={tpl.key}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-600 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy-800">{tpl.title}</h3>
                          <Badge variant="info" size="sm">邮件模板</Badge>
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingNotify(null)}>
                            <X className="w-4 h-4" />
                            取消
                          </Button>
                          <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveNotify}>
                            保存
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" leftIcon={<Edit3 className="w-4 h-4" />} onClick={() => setEditingNotify(tpl.key)}>
                          编辑
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-navy-600 mb-1.5">邮件主题</label>
                        {isEditing ? (
                          <Input
                            value={tpl.subject}
                            onChange={(e) => saveNotify(tpl.key, 'subject', e.target.value)}
                          />
                        ) : (
                          <div className="px-4 py-2.5 rounded-lg bg-slatebg-50 border border-slatebg-200 text-sm text-navy-700">
                            {tpl.subject}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-600 mb-1.5">
                          邮件内容
                          <span className="ml-2 text-navy-400 font-normal">支持变量：{'{{变量名}}'}</span>
                        </label>
                        {isEditing ? (
                          <textarea
                            rows={8}
                            value={tpl.content}
                            onChange={(e) => saveNotify(tpl.key, 'content', e.target.value)}
                            className={cn(
                              'w-full px-4 py-3 rounded-lg border bg-white text-sm text-navy-900',
                              'placeholder:text-navy-300 focus:outline-none transition-all font-mono',
                              'border-slate-200 hover:border-navy-300 focus:border-navy-500 focus:ring-2 focus:ring-navy-200'
                            )}
                          />
                        ) : (
                          <div className="px-4 py-3 rounded-lg bg-slatebg-50 border border-slatebg-200 text-sm text-navy-700 whitespace-pre-wrap min-h-[160px] leading-relaxed">
                            {tpl.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === 'dictionary' && (
            <div className="space-y-5 max-w-4xl">
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success-100 text-success-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-navy-800">部门列表</h2>
                      <p className="text-xs text-navy-500">共 {departments.length} 个部门</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <div className="flex-1">
                    <Input
                      label="部门名称"
                      placeholder="如：财务部"
                      value={deptInput.name}
                      onChange={(e) => setDeptInput((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="部门主管"
                      placeholder="如：张三"
                      value={deptInput.manager}
                      onChange={(e) => setDeptInput((prev) => ({ ...prev, manager: e.target.value }))}
                    />
                  </div>
                  <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={addDepartment}>
                    添加
                  </Button>
                </div>
                <div className="border border-slatebg-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slatebg-50 border-b border-slatebg-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-navy-600 w-16">#</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600">部门名称</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600">部门主管</th>
                        <th className="text-right px-4 py-3 font-medium text-navy-600 w-24">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d, i) => (
                        <tr key={d.id} className="border-b border-slatebg-100 last:border-0 hover:bg-slatebg-50/50">
                          <td className="px-4 py-3 text-navy-400">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-navy-800">{d.name}</td>
                          <td className="px-4 py-3 text-navy-600">{d.manager}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeDepartment(d.id)}
                              className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warning-100 text-warning-600 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-navy-800">岗位列表</h2>
                      <p className="text-xs text-navy-500">共 {positions.length} 个岗位</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <div className="flex-1">
                    <Input
                      label="岗位名称"
                      placeholder="如：UI设计师"
                      value={posInput.name}
                      onChange={(e) => setPosInput((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Select
                      label="所属部门"
                      options={departments.map((d) => ({ value: d.name, label: d.name }))}
                      value={posInput.dept}
                      onChange={(v) => setPosInput((prev) => ({ ...prev, dept: v }))}
                      placeholder="选择部门"
                    />
                  </div>
                  <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={addPosition}>
                    添加
                  </Button>
                </div>
                <div className="border border-slatebg-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slatebg-50 border-b border-slatebg-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-navy-600 w-16">#</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600">岗位名称</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600">所属部门</th>
                        <th className="text-right px-4 py-3 font-medium text-navy-600 w-24">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((p, i) => (
                        <tr key={p.id} className="border-b border-slatebg-100 last:border-0 hover:bg-slatebg-50/50">
                          <td className="px-4 py-3 text-navy-400">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-navy-800">{p.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant="neutral" size="sm">{p.dept}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removePosition(p.id)}
                              className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
