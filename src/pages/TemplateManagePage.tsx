import { useState, useMemo } from 'react';
import {
  FileText,
  Shield,
  Monitor,
  FolderOpen,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Search,
  X,
  Check,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, Button, Badge, Modal, Input, Select } from '@/components/common';
import { useTemplateStore, useUIStore } from '@/stores';
import type { DocumentCategory, DocumentTemplate } from '@/types';

const CATEGORY_CONFIG: Record<DocumentCategory | 'all', { label: string; icon: typeof FileText; color: string }> = {
  all: { label: '全部', icon: FolderOpen, color: 'navy' },
  contract: { label: '劳动合同', icon: FileText, color: 'copper' },
  agreement: { label: '保密协议', icon: Shield, color: 'info' },
  equipment: { label: '设备领用', icon: Monitor, color: 'success' },
  other: { label: '其他', icon: FileCheck, color: 'neutral' },
};

const FIELD_OPTIONS = [
  { value: 'name', label: '员工姓名' },
  { value: 'idCard', label: '身份证号' },
  { value: 'position', label: '岗位' },
  { value: 'joinDate', label: '入职日期' },
  { value: 'departmentName', label: '部门' },
  { value: 'phone', label: '手机号' },
  { value: 'email', label: '邮箱' },
  { value: 'managerName', label: '部门主管' },
];

const CATEGORY_OPTIONS = [
  { value: 'contract', label: '劳动合同' },
  { value: 'agreement', label: '保密协议' },
  { value: 'equipment', label: '设备领用' },
  { value: 'other', label: '其他' },
];

interface TemplateForm {
  id?: string;
  name: string;
  category: DocumentCategory;
  description: string;
  contentTemplate: string;
  requiredFields: string[];
}

const EMPTY_FORM: TemplateForm = {
  name: '',
  category: 'contract',
  description: '',
  contentTemplate: '',
  requiredFields: [],
};

export default function TemplateManagePage() {
  const { templates, generatedDocs } = useTemplateStore();
  const { showToast } = useUIStore();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateForm | null>(null);
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const [showPreview, setShowPreview] = useState<DocumentTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DocumentTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCategory = activeCategory === 'all' || t.category === activeCategory;
      const matchSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [templates, activeCategory, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: templates.length,
      contract: templates.filter((t) => t.category === 'contract').length,
      agreement: templates.filter((t) => t.category === 'agreement').length,
      equipment: templates.filter((t) => t.category === 'equipment').length,
      other: templates.filter((t) => t.category === 'other').length,
      generated: generatedDocs.length,
    };
  }, [templates, generatedDocs]);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (tpl: DocumentTemplate) => {
    setEditingTemplate(tpl);
    setForm({
      id: tpl.id,
      name: tpl.name,
      category: tpl.category,
      description: tpl.description,
      contentTemplate: tpl.contentTemplate,
      requiredFields: [...tpl.requiredFields],
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('请输入模板名称', 'error');
      return;
    }
    if (form.requiredFields.length === 0) {
      showToast('请至少选择一个必填字段', 'warning');
    }

    if (editingTemplate) {
      showToast(`模板「${form.name}」已更新`, 'success');
    } else {
      showToast(`模板「${form.name}」已创建`, 'success');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      showToast(`模板「${confirmDelete.name}」已删除`, 'success');
      setConfirmDelete(null);
    }
  };

  const handleDuplicate = (tpl: DocumentTemplate) => {
    showToast(`已复制模板「${tpl.name}」`, 'success');
  };

  const toggleField = (field: string) => {
    setForm((prev) => ({
      ...prev,
      requiredFields: prev.requiredFields.includes(field)
        ? prev.requiredFields.filter((f) => f !== field)
        : [...prev.requiredFields, field],
    }));
  };

  const getCategoryIconBg = (category: DocumentCategory) => {
    switch (category) {
      case 'contract': return 'bg-gradient-to-br from-copper-400 to-copper-600';
      case 'agreement': return 'bg-gradient-to-br from-info-400 to-info-600';
      case 'equipment': return 'bg-gradient-to-br from-success-400 to-success-600';
      default: return 'bg-gradient-to-br from-navy-400 to-navy-600';
    }
  };

  const CATEGORY_TABS: Array<DocumentCategory | 'all'> = ['all', 'contract', 'agreement', 'equipment', 'other'];

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900 mb-1">模板管理</h1>
          <p className="text-sm text-navy-500">管理入职流程中使用的各类文档模板</p>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          新建模板
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: '模板总数', count: stats.total, color: 'navy', icon: FolderOpen },
          { label: '劳动合同', count: stats.contract, color: 'copper', icon: FileText },
          { label: '保密协议', count: stats.agreement, color: 'info', icon: Shield },
          { label: '设备领用', count: stats.equipment, color: 'success', icon: Monitor },
          { label: '已生成文档', count: stats.generated, color: 'neutral', icon: FileCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-2xl border border-slatebg-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    item.color === 'navy' && 'bg-navy-100 text-navy-600',
                    item.color === 'copper' && 'bg-copper-100 text-copper-600',
                    item.color === 'info' && 'bg-info-100 text-info-600',
                    item.color === 'success' && 'bg-success-100 text-success-600',
                    item.color === 'neutral' && 'bg-slatebg-100 text-navy-600'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-2xl font-bold font-serif text-navy-800">{item.count}</span>
              </div>
              <p className="text-sm text-navy-500">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slatebg-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-slatebg-100">
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORY_TABS.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              const active = activeCategory === cat;
              const count = cat === 'all' ? stats.total : stats[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    active
                      ? 'bg-navy-800 text-white shadow-sm'
                      : 'text-navy-600 hover:bg-slatebg-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs',
                      active ? 'bg-white/20 text-white' : 'bg-slatebg-100 text-navy-500'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="w-full sm:w-64">
            <Input
              placeholder="搜索模板..."
              prefixIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-5">
          {filteredTemplates.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slatebg-100 flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-navy-300" />
              </div>
              <h3 className="text-lg font-semibold text-navy-700 mb-1">暂无模板</h3>
              <p className="text-sm text-navy-400 mb-4">点击右上角按钮创建第一个模板</p>
              <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                新建模板
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((tpl) => {
                const catConfig = CATEGORY_CONFIG[tpl.category];
                const CatIcon = catConfig.icon;
                return (
                  <Card
                    key={tpl.id}
                    hoverable
                    className="group transition-all"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-sm flex-shrink-0',
                          getCategoryIconBg(tpl.category)
                        )}
                      >
                        <CatIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-navy-800 truncate">{tpl.name}</h3>
                        </div>
                        <Badge
                          variant={
                            tpl.category === 'contract' ? 'warning' :
                            tpl.category === 'agreement' ? 'info' :
                            tpl.category === 'equipment' ? 'success' : 'neutral'
                          }
                          size="sm"
                        >
                          {catConfig.label}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-navy-600 mb-4 line-clamp-2 min-h-[40px]">
                      {tpl.description || '暂无描述'}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {tpl.requiredFields.slice(0, 4).map((field) => {
                        const opt = FIELD_OPTIONS.find((o) => o.value === field);
                        return (
                          <span
                            key={field}
                            className="px-2 py-0.5 text-xs rounded-md bg-slatebg-50 text-navy-600 border border-slatebg-200"
                          >
                            {opt?.label || field}
                          </span>
                        );
                      })}
                      {tpl.requiredFields.length > 4 && (
                        <span className="px-2 py-0.5 text-xs rounded-md bg-slatebg-50 text-navy-500 border border-slatebg-200">
                          +{tpl.requiredFields.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => setShowPreview(tpl)}
                      >
                        预览
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        leftIcon={<Edit3 className="w-4 h-4" />}
                        onClick={() => openEditModal(tpl)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Copy className="w-4 h-4" />}
                        onClick={() => handleDuplicate(tpl)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        onClick={() => setConfirmDelete(tpl)}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? '编辑模板' : '新建模板'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setShowModal(false)}>
              <X className="w-4 h-4" />
              取消
            </Button>
            <Button variant="primary" size="md" leftIcon={<Check className="w-4 h-4" />} onClick={handleSave}>
              {editingTemplate ? '保存修改' : '创建模板'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="模板名称"
              placeholder="如：标准劳动合同"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Select
              label="模板类别"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(v) => setForm((prev) => ({ ...prev, category: v as DocumentCategory }))}
            />
          </div>

          <Input
            label="模板描述"
            placeholder="简要描述模板用途..."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">模板内容</label>
            <div className="text-xs text-navy-400 mb-2">
              使用 <code className="px-1.5 py-0.5 bg-slatebg-100 rounded text-navy-600">{`{{字段名}}`}</code> 作为占位符
            </div>
            <textarea
              rows={8}
              value={form.contentTemplate}
              onChange={(e) => setForm((prev) => ({ ...prev, contentTemplate: e.target.value }))}
              placeholder={`<h1>劳动合同</h1>\n<p>甲方：公司 乙方：{{name}}</p>\n<p>身份证号：{{idCard}}</p>\n<p>岗位：{{position}}</p>`}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-navy-900',
                'placeholder:text-navy-300 focus:outline-none transition-all',
                'border-slate-200 hover:border-navy-300 focus:border-navy-500 focus:ring-2 focus:ring-navy-200',
                'font-mono leading-relaxed'
              )}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-navy-800">必填字段</label>
              <span className="text-xs text-navy-400">
                已选 {form.requiredFields.length} 个字段
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FIELD_OPTIONS.map((opt) => {
                const selected = form.requiredFields.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleField(opt.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all border',
                      selected
                        ? 'bg-navy-50 border-navy-300 text-navy-800'
                        : 'bg-white border-slatebg-200 text-navy-600 hover:border-navy-200 hover:bg-navy-50/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all',
                        selected ? 'bg-navy-600 border-navy-600' : 'border-slatebg-300'
                      )}
                    >
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!showPreview}
        onClose={() => setShowPreview(null)}
        title={showPreview?.name || '模板预览'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setShowPreview(null)}>
              <X className="w-4 h-4" />
              关闭
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => {
                if (showPreview) {
                  openEditModal(showPreview);
                  setShowPreview(null);
                }
              }}
            >
              编辑模板
            </Button>
          </div>
        }
      >
        {showPreview && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slatebg-100">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl text-white flex items-center justify-center',
                  getCategoryIconBg(showPreview.category)
                )}
              >
                {(() => {
                  const I = CATEGORY_CONFIG[showPreview.category].icon;
                  return <I className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <p className="font-semibold text-navy-800">{showPreview.name}</p>
                <p className="text-xs text-navy-500">{showPreview.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {showPreview.requiredFields.map((field) => {
                const opt = FIELD_OPTIONS.find((o) => o.value === field);
                return (
                  <Badge key={field} variant="info" size="sm">
                    {opt?.label || field}
                  </Badge>
                );
              })}
            </div>

            <div>
              <p className="text-sm font-medium text-navy-700 mb-2">内容预览</p>
              <div
                className="p-6 rounded-xl bg-white border border-slatebg-200 shadow-sm min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: showPreview.contentTemplate }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="删除确认"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setConfirmDelete(null)}>
              取消
            </Button>
            <Button variant="danger" size="md" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
              确认删除
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-50 border border-danger-200 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-danger-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-navy-800 mb-1">
              确定要删除「{confirmDelete?.name}」吗？
            </h4>
            <p className="text-sm text-navy-500">
              此操作不可撤销，已使用该模板生成的文档不会受影响。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
