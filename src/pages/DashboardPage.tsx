import { Link, useNavigate } from 'react-router-dom';
import { Layers, AlertCircle, UserPlus, TrendingUp, Plus, List, Download, CheckCircle2, Circle, ChevronRight, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, Button, Badge, ProgressBar } from '@/components/common';
import { useBatchStore, useTaskStore, useUIStore } from '@/stores';
import type { Batch, BatchStatus, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

const STEPS = ['创建批次', '名单导入', '模板填充', '账号清单', '任务分派', '结果核对'];
const GRADIENTS = ['from-navy-700 via-navy-600 to-navy-800', 'from-copper-600 via-copper-500 to-warning-500', 'from-info-600 via-info-500 to-navy-500', 'from-success-600 via-success-500 to-navy-600'];
const TASK_COLORS: Record<TaskStatus, string> = { pending: '#8aa9c8', in_progress: '#d4a574', completed: '#2d8659', overdue: '#c75050', cancelled: '#dde4ee' };
const TASK_LABELS: Record<TaskStatus, string> = { pending: '待处理', in_progress: '进行中', completed: '已完成', overdue: '已逾期', cancelled: '已取消' };
const BATCH_STATUS: Record<BatchStatus, { v: any; l: string }> = { draft: { v: 'neutral', l: '草稿' }, importing: { v: 'info', l: '导入中' }, processing: { v: 'warning', l: '处理中' }, in_progress: { v: 'warning', l: '进行中' }, completed: { v: 'success', l: '已完成' }, archived: { v: 'neutral', l: '已归档' } };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { batches, employees, createBatch } = useBatchStore();
  const { tasks } = useTaskStore();
  const { showToast } = useUIStore();

  const activeBatches = batches.filter(b => b.status !== 'completed' && b.status !== 'archived');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const thisMonth = employees.filter(e => {
    const d = new Date(e.joinDate);
    return d >= monthStart && d <= monthEnd;
  });
  const avg = batches.length ? Math.round(batches.reduce((s, b) => s + b.progressPercent, 0) / batches.length) : 0;
  const statsData = [
    { icon: Layers, label: '进行中批次', value: activeBatches.length, suffix: '个', g: GRADIENTS[0] },
    { icon: AlertCircle, label: '待处理任务', value: pendingTasks.length, suffix: '项', g: GRADIENTS[1] },
    { icon: UserPlus, label: '本月入职人数', value: thisMonth.length, suffix: '人', g: GRADIENTS[2] },
    { icon: TrendingUp, label: '平均完成率', value: avg, suffix: '%', g: GRADIENTS[3] },
  ];
  const pieData = (Object.keys(TASK_LABELS) as TaskStatus[]).map(s => ({ name: TASK_LABELS[s], value: tasks.filter(t => t.status === s).length, color: TASK_COLORS[s] }));
  const recent = [...batches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const onCreate = () => {
    const b = createBatch({});
    navigate(`/batches/${b.id}/import`);
    showToast('批次创建成功', 'success');
  };
  const onEnter = (b: Batch) => {
    const routes = ['import', 'templates', 'accounts', 'tasks', 'review'];
    navigate(`/batches/${b.id}/${routes[Math.min(b.currentStep, 4)] || 'import'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-serif">仪表盘</h1>
          <p className="text-sm text-navy-500 mt-1">欢迎回来，实时查看入职进度</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={onCreate}>创建批次</Button>
          <Button variant="secondary" leftIcon={<List size={18} />} onClick={() => navigate('/batches')}>查看全部</Button>
          <Button variant="ghost" leftIcon={<Download size={18} />} onClick={() => showToast('模板下载中...', 'info')}>下载模板</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={cn('relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer', s.g)}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center mb-4">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{s.value}</span>
                  <span className="text-sm opacity-80">{s.suffix}</span>
                </div>
                <p className="text-sm opacity-85 mt-1">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Card header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy-800 font-serif">批次进度时间线</h3>
          <Badge variant="info" dot size="sm">共 {activeBatches.length} 个进行中</Badge>
        </div>
      }>
        {activeBatches.length === 0 ? <div className="py-8 text-center text-navy-500 text-sm">暂无进行中的批次</div> : (
          <div className="space-y-6">
            {activeBatches.map(b => (
              <div key={b.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-navy-800">{b.name}</span>
                    <Badge variant={BATCH_STATUS[b.status].v as any} size="sm">{BATCH_STATUS[b.status].l}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-navy-600">
                    <Users size={14} /><span>{b.employeeCount} 人</span>
                    <span className="mx-2">·</span><span>{b.progressPercent}%</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {STEPS.map((s, i) => {
                      const done = i < b.currentStep;
                      const cur = i === b.currentStep;
                      return (
                        <div key={s} className="flex flex-col items-center relative z-10 flex-1">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-all', done ? 'bg-success-500 text-white' : cur ? 'bg-copper-500 text-white ring-4 ring-copper-100' : 'bg-slatebg-200 text-navy-400')}>
                            {done ? <CheckCircle2 size={16} /> : <Circle size={12} />}
                          </div>
                          <span className={cn('text-xs mt-2 text-center', done || cur ? 'text-navy-700 font-medium' : 'text-navy-400')}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute top-4 left-0 right-0 h-1 bg-slatebg-200 -z-0 mx-8">
                    <div className="h-full bg-gradient-to-r from-success-500 to-copper-500 transition-all duration-500" style={{ width: `${(b.currentStep / (STEPS.length - 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3" header={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-navy-800 font-serif">最近批次</h3>
            <Link to="/batches" className="text-sm text-navy-600 hover:text-navy-800 flex items-center gap-1 transition-colors">查看全部 <ChevronRight size={14} /></Link>
          </div>
        }>
          {recent.length === 0 ? <div className="py-8 text-center text-navy-500 text-sm">暂无批次</div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slatebg-200">
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-2">批次名称</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-2">状态</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-2 w-40">进度</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-2">员工</th>
                  <th className="text-right text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-2">操作</th>
                </tr></thead>
                <tbody className="divide-y divide-slatebg-100">
                  {recent.map(b => (
                    <tr key={b.id} className="hover:bg-slatebg-50 transition-colors">
                      <td className="py-4 px-2"><div className="font-medium text-navy-800 text-sm">{b.name}</div><div className="text-xs text-navy-400 mt-0.5">{new Date(b.createdAt).toLocaleDateString('zh-CN')}</div></td>
                      <td className="py-4 px-2"><Badge variant={BATCH_STATUS[b.status].v as any} size="sm" dot>{BATCH_STATUS[b.status].l}</Badge></td>
                      <td className="py-4 px-2"><ProgressBar value={b.progressPercent} variant="slim" showPercentage /></td>
                      <td className="py-4 px-2"><span className="text-sm text-navy-700">{b.employeeCount} 人</span></td>
                      <td className="py-4 px-2 text-right"><Button variant="ghost" size="sm" onClick={() => onEnter(b)} rightIcon={<ChevronRight size={14} />}>进入</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2" header={<h3 className="text-lg font-semibold text-navy-800 font-serif">任务状态分布</h3>}>
          {tasks.length === 0 ? <div className="py-8 text-center text-navy-500 text-sm">暂无任务</div> : (
            <>
              <div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart>
                <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {pieData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #dde4ee', fontSize: '12px' }} formatter={(v: number, n: string) => [`${v} 项`, n]} />
              </PieChart></ResponsiveContainer></div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieData.filter(d => d.value > 0).map(i => (
                  <div key={i.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: i.color }} />
                    <span className="text-navy-600">{i.name}</span>
                    <span className="ml-auto font-medium text-navy-800">{i.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
