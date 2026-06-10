import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Edit2, Trash2, ChevronRight, ChevronLeft, AlertTriangle, Layers } from 'lucide-react';
import { Card, Button, Badge, ProgressBar, Input, Modal, Select, EmptyState } from '@/components/common';
import { useBatchStore, useUIStore } from '@/stores';
import type { Batch, BatchStatus } from '@/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;
const STEPS = ['创建批次', '名单导入', '模板填充', '账号清单', '任务分派', '结果核对'];
const STATUS_OPTIONS = [{ value: 'all', label: '全部状态' }, { value: 'draft', label: '草稿' }, { value: 'importing', label: '导入中' }, { value: 'processing', label: '处理中' }, { value: 'in_progress', label: '进行中' }, { value: 'completed', label: '已完成' }, { value: 'archived', label: '已归档' }];
const BATCH_STATUS: Record<BatchStatus, { v: any; l: string }> = { draft: { v: 'neutral', l: '草稿' }, importing: { v: 'info', l: '导入中' }, processing: { v: 'warning', l: '处理中' }, in_progress: { v: 'warning', l: '进行中' }, completed: { v: 'success', l: '已完成' }, archived: { v: 'neutral', l: '已归档' } };

export default function BatchListPage() {
  const navigate = useNavigate();
  const { batches, createBatch, updateBatch, deleteBatch, setCurrentBatch } = useBatchStore();
  const { showToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [sel, setSel] = useState<Batch | null>(null);

  const [fName, setFName] = useState('');
  const [fDate, setFDate] = useState('');
  const [fNotes, setFNotes] = useState('');

  const filtered = useMemo(() => batches.filter(b => {
    const ms = b.name.toLowerCase().includes(search.toLowerCase()) || (b.notes?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const mst = status === 'all' || b.status === status;
    const d = new Date(b.startDate);
    const mf = !from || d >= new Date(from);
    const mt = !to || d <= new Date(to + 'T23:59:59');
    return ms && mst && mf && mt;
  }), [batches, search, status, from, to]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [filtered]);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetForm = () => { setFName(''); setFDate(new Date().toISOString().split('T')[0]); setFNotes(''); };
  const openCreate = () => { resetForm(); setFName(`2026年${new Date().getMonth() + 1}月第${batches.length + 1}批入职`); setCreateOpen(true); };
  const openEdit = (b: Batch) => { setSel(b); setFName(b.name); setFDate(b.startDate); setFNotes(b.notes || ''); setEditOpen(true); };
  const openDel = (b: Batch) => { setSel(b); setDelOpen(true); };

  const onCreate = () => {
    if (!fName.trim()) { showToast('请输入批次名称', 'error'); return; }
    const b = createBatch({ name: fName.trim(), startDate: fDate || new Date().toISOString().split('T')[0], notes: fNotes.trim() || undefined });
    setCreateOpen(false); setCurrentBatch(b.id); navigate(`/batches/${b.id}/import`); showToast('批次创建成功', 'success');
  };
  const onEdit = () => {
    if (!sel || !fName.trim()) { showToast('请输入批次名称', 'error'); return; }
    updateBatch(sel.id, { name: fName.trim(), startDate: fDate || sel.startDate, notes: fNotes.trim() || undefined });
    setEditOpen(false); showToast('批次更新成功', 'success');
  };
  const onDel = () => {
    if (!sel) return;
    deleteBatch(sel.id); setDelOpen(false); setSel(null); showToast('批次已删除', 'success');
    if (page > 1 && paged.length === 1) setPage(page - 1);
  };
  const onEnter = (b: Batch) => {
    setCurrentBatch(b.id);
    const routes = ['import', 'templates', 'accounts', 'tasks', 'review'];
    navigate(`/batches/${b.id}/${routes[Math.min(b.currentStep, 4)] || 'import'}`);
  };

  const FormBody = () => (
    <div className="space-y-4">
      <Input label="批次名称" placeholder="请输入批次名称" value={fName} onChange={e => setFName(e.target.value)} />
      <Input label="入职日期" type="date" value={fDate} onChange={e => setFDate(e.target.value)} />
      <div>
        <label className="block text-sm font-medium text-navy-800 mb-1.5">备注</label>
        <textarea className={cn('w-full rounded-lg border bg-white text-navy-900 text-sm border-slate-200 hover:border-navy-300 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 focus:outline-none transition-all py-2.5 px-3 resize-none min-h-[80px]')} placeholder="可选：填写批次备注信息..." value={fNotes} onChange={e => setFNotes(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-serif">批次管理</h1>
          <p className="text-sm text-navy-500 mt-1">共 {batches.length} 个批次，筛选 {filtered.length} 个</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={openCreate}>创建批次</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <Input placeholder="搜索批次名称或备注..." prefixIcon={<Search size={16} />} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <Select options={STATUS_OPTIONS} value={status} onChange={v => { setStatus(v); setPage(1); }} />
          <Input type="date" placeholder="起始日期" prefixIcon={<Calendar size={16} />} value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
          <Input type="date" placeholder="结束日期" prefixIcon={<Calendar size={16} />} value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
        </div>

        {sorted.length === 0 ? (
          <EmptyState icon={<Layers size={36} />} title="暂无批次数据" description={batches.length === 0 ? '创建您的第一个入职批次，开始自动化入职流程' : '当前筛选条件下没有匹配的批次'} action={batches.length === 0 ? { label: '创建批次', onClick: openCreate, icon: <Plus size={16} /> } : undefined} />
        ) : (
          <>
            <div className="overflow-x-auto -mx-5 -my-5">
              <table className="w-full">
                <thead className="bg-slatebg-50"><tr>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-5">批次名称</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-3">入职日期</th>
                  <th className="text-center text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-3">员工数</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-3">当前步骤</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-3 w-40">进度</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-3">状态</th>
                  <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-3">创建时间</th>
                  <th className="text-right text-xs font-medium text-navy-500 uppercase tracking-wider py-3 px-5">操作</th>
                </tr></thead>
                <tbody className="divide-y divide-slatebg-100">
                  {paged.map(b => (
                    <tr key={b.id} className="hover:bg-slatebg-50 transition-colors">
                      <td className="py-4 px-5"><Link to={`/batches/${b.id}/import`} className="font-medium text-navy-800 text-sm hover:text-copper-600 transition-colors">{b.name}</Link>{b.notes && <div className="text-xs text-navy-400 mt-0.5 line-clamp-1">{b.notes}</div>}</td>
                      <td className="py-4 px-3 text-sm text-navy-700">{b.startDate}</td>
                      <td className="py-4 px-3 text-center text-sm font-medium text-navy-800">{b.employeeCount}</td>
                      <td className="py-4 px-3"><span className="text-xs text-navy-600 bg-navy-50 px-2 py-1 rounded-md">{STEPS[b.currentStep] || STEPS[0]}</span></td>
                      <td className="py-4 px-3"><ProgressBar value={b.progressPercent} variant="slim" showPercentage /></td>
                      <td className="py-4 px-3"><Badge variant={BATCH_STATUS[b.status].v as any} size="sm" dot>{BATCH_STATUS[b.status].l}</Badge></td>
                      <td className="py-4 px-3 text-sm text-navy-500">{new Date(b.createdAt).toLocaleDateString('zh-CN')}</td>
                      <td className="py-4 px-5"><div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors" title="编辑"><Edit2 size={16} /></button>
                        <button onClick={() => openDel(b)} className="p-2 rounded-lg text-navy-400 hover:text-danger-600 hover:bg-danger-50 transition-colors" title="删除"><Trash2 size={16} /></button>
                        <Button variant="ghost" size="sm" onClick={() => onEnter(b)} rightIcon={<ChevronRight size={14} />}>进入</Button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-5 border-t border-slatebg-100">
                <div className="text-sm text-navy-500">第 {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, sorted.length)} 条，共 {sorted.length} 条</div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={page === 1} leftIcon={<ChevronLeft size={16} />} onClick={() => setPage(page - 1)}>上一页</Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={cn('w-9 h-9 rounded-lg text-sm font-medium transition-all', page === i + 1 ? 'bg-navy-800 text-white shadow-md' : 'text-navy-600 hover:bg-slatebg-100')}>{i + 1}</button>
                  ))}
                  <Button variant="secondary" size="sm" disabled={page === totalPages} rightIcon={<ChevronRight size={16} />} onClick={() => setPage(page + 1)}>下一页</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="创建入职批次" size="md" footer={<><Button variant="secondary" onClick={() => setCreateOpen(false)}>取消</Button><Button variant="primary" onClick={onCreate}>创建并进入</Button></>}>
        <FormBody />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="编辑批次信息" size="md" footer={<><Button variant="secondary" onClick={() => setEditOpen(false)}>取消</Button><Button variant="primary" onClick={onEdit}>保存修改</Button></>}>
        <FormBody />
      </Modal>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title="确认删除批次" size="sm" footer={<><Button variant="secondary" onClick={() => setDelOpen(false)}>取消</Button><Button variant="danger" onClick={onDel}>确认删除</Button></>}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6 text-danger-500" /></div>
          <div>
            <p className="text-navy-800 font-medium mb-1">确定要删除「{sel?.name}」吗？</p>
            <p className="text-sm text-navy-500 leading-relaxed">删除后，该批次的所有员工数据和关联任务将被一并清除，且无法恢复。请谨慎操作。</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
