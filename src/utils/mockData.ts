import type {
  Department,
  DocumentTemplate,
  TaskTemplate,
  Batch,
  Employee,
  Task,
  User,
  AccountItem,
  AccountType,
} from '../types';

export const mockDepartments: Department[] = [
  {
    id: 'dept-001',
    name: '技术部',
    managerName: '张伟',
    managerEmail: 'zhangwei@company.com',
    employeeCount: 45,
  },
  {
    id: 'dept-002',
    name: '市场部',
    managerName: '李娜',
    managerEmail: 'lina@company.com',
    employeeCount: 28,
  },
  {
    id: 'dept-003',
    name: '人事部',
    managerName: '王芳',
    managerEmail: 'wangfang@company.com',
    employeeCount: 12,
  },
];

export const mockDocumentTemplates: DocumentTemplate[] = [
  {
    id: 'tpl-doc-001',
    name: '劳动合同',
    category: 'contract',
    description: '标准劳动合同模板，包含试用期、薪资、工作时间等核心条款',
    thumbnail: 'contract',
    requiredFields: ['name', 'idCard', 'position', 'joinDate', 'departmentName'],
    contentTemplate: '<h1>劳动合同</h1><p>甲方：公司 乙方：{{name}}</p><p>身份证号：{{idCard}}</p><p>岗位：{{position}}</p><p>入职日期：{{joinDate}}</p><p>部门：{{departmentName}}</p>',
  },
  {
    id: 'tpl-doc-002',
    name: '保密协议',
    category: 'agreement',
    description: '员工保密协议，涵盖商业秘密保护、竞业限制等内容',
    thumbnail: 'agreement',
    requiredFields: ['name', 'idCard', 'joinDate', 'departmentName'],
    contentTemplate: '<h1>保密协议</h1><p>甲方：公司 乙方：{{name}}</p><p>身份证号：{{idCard}}</p><p>入职日期：{{joinDate}}</p><p>所属部门：{{departmentName}}</p>',
  },
  {
    id: 'tpl-doc-003',
    name: '竞业限制协议',
    category: 'agreement',
    description: '离职后竞业限制协议，规定限制范围、期限及补偿金',
    thumbnail: 'agreement',
    requiredFields: ['name', 'idCard', 'position', 'departmentName'],
    contentTemplate: '<h1>竞业限制协议</h1><p>甲方：公司 乙方：{{name}}</p><p>身份证号：{{idCard}}</p><p>担任岗位：{{position}}</p><p>所属部门：{{departmentName}}</p>',
  },
  {
    id: 'tpl-doc-004',
    name: '设备领用单',
    category: 'equipment',
    description: '办公设备领用登记单，包含电脑、显示器等设备清单',
    thumbnail: 'equipment',
    requiredFields: ['name', 'departmentName', 'joinDate', 'managerName'],
    contentTemplate: '<h1>设备领用单</h1><p>领用人：{{name}}</p><p>所属部门：{{departmentName}}</p><p>领用日期：{{joinDate}}</p><p>部门主管：{{managerName}}</p>',
  },
  {
    id: 'tpl-doc-005',
    name: '入职须知',
    category: 'other',
    description: '新员工入职指引手册，包含公司规章制度、福利待遇等',
    thumbnail: 'other',
    requiredFields: ['name', 'joinDate', 'departmentName'],
    contentTemplate: '<h1>入职须知</h1><p>欢迎 {{name}} 加入公司！</p><p>入职日期：{{joinDate}}</p><p>所属部门：{{departmentName}}</p><p>请仔细阅读以下规章制度...</p>',
  },
];

export const mockTaskTemplates: TaskTemplate[] = [
  {
    id: 'tpl-task-001',
    name: '开通企业邮箱',
    description: '为新员工开通企业邮箱账号，格式为姓名拼音@company.com',
    defaultRole: 'admin',
    defaultPriority: 'urgent',
    defaultDueDays: 1,
  },
  {
    id: 'tpl-task-002',
    name: '制作员工工牌',
    description: '根据员工信息制作工牌，包含照片、姓名、部门、工号',
    defaultRole: 'admin',
    defaultPriority: 'high',
    defaultDueDays: 2,
  },
  {
    id: 'tpl-task-003',
    name: '申请门禁权限',
    description: '为新员工申请办公区门禁卡权限，根据部门分配区域',
    defaultRole: 'admin',
    defaultPriority: 'high',
    defaultDueDays: 1,
  },
  {
    id: 'tpl-task-004',
    name: '配置VPN账号',
    description: '开通远程办公VPN账号，发送初始密码至个人邮箱',
    defaultRole: 'admin',
    defaultPriority: 'medium',
    defaultDueDays: 2,
  },
  {
    id: 'tpl-task-005',
    name: '安排工位',
    description: '与部门主管确认工位位置，准备桌椅及办公设备',
    defaultRole: 'manager',
    defaultPriority: 'urgent',
    defaultDueDays: 1,
  },
  {
    id: 'tpl-task-006',
    name: '发放办公设备',
    description: '发放笔记本电脑、显示器、鼠标键盘等办公设备并登记',
    defaultRole: 'admin',
    defaultPriority: 'high',
    defaultDueDays: 1,
  },
  {
    id: 'tpl-task-007',
    name: '开通系统权限',
    description: '根据岗位开通OA、ERP、CRM等业务系统访问权限',
    defaultRole: 'admin',
    defaultPriority: 'high',
    defaultDueDays: 2,
  },
  {
    id: 'tpl-task-008',
    name: '安排入职培训',
    description: '组织公司文化、规章制度、业务流程等入职培训课程',
    defaultRole: 'hr',
    defaultPriority: 'medium',
    defaultDueDays: 5,
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-hr-001',
    name: '刘晓梅',
    role: 'hr',
    email: 'liuxiaomei@company.com',
    phone: '13800138001',
    departmentId: 'dept-003',
  },
  {
    id: 'user-hr-002',
    name: '陈建国',
    role: 'hr',
    email: 'chenjianguo@company.com',
    phone: '13800138002',
    departmentId: 'dept-003',
  },
  {
    id: 'user-hr-003',
    name: '赵丽华',
    role: 'hr',
    email: 'zhaolihua@company.com',
    phone: '13800138003',
    departmentId: 'dept-003',
  },
  {
    id: 'user-admin-001',
    name: '孙志强',
    role: 'admin',
    email: 'sunzhiqiang@company.com',
    phone: '13800138004',
  },
  {
    id: 'user-admin-002',
    name: '周美玲',
    role: 'admin',
    email: 'zhoumeiling@company.com',
    phone: '13800138005',
  },
  {
    id: 'user-mgr-001',
    name: '张伟',
    role: 'manager',
    email: 'zhangwei@company.com',
    phone: '13900139001',
    departmentId: 'dept-001',
  },
  {
    id: 'user-mgr-002',
    name: '李娜',
    role: 'manager',
    email: 'lina@company.com',
    phone: '13900139002',
    departmentId: 'dept-002',
  },
  {
    id: 'user-mgr-003',
    name: '王芳',
    role: 'manager',
    email: 'wangfang@company.com',
    phone: '13900139003',
    departmentId: 'dept-003',
  },
];

export const mockEmployeesBatch1: Employee[] = [
  {
    id: 'emp-b1-001',
    batchId: 'batch-001',
    name: '王浩然',
    position: '高级前端工程师',
    joinDate: '2026-06-15',
    departmentId: 'dept-001',
    departmentName: '技术部',
    phone: '13700137101',
    email: 'wanghaoran@company.com',
    idCard: '110101199503151234',
    gender: 'male',
    managerId: 'user-mgr-001',
    managerName: '张伟',
    workstation: 'A-3F-12',
  },
  {
    id: 'emp-b1-002',
    batchId: 'batch-001',
    name: '李思琪',
    position: 'Java后端工程师',
    joinDate: '2026-06-15',
    departmentId: 'dept-001',
    departmentName: '技术部',
    phone: '13700137102',
    email: 'lisiqi@company.com',
    idCard: '310101199608204567',
    gender: 'female',
    managerId: 'user-mgr-001',
    managerName: '张伟',
    workstation: 'A-3F-13',
    _missingFields: ['phone'],
  },
  {
    id: 'emp-b1-003',
    batchId: 'batch-001',
    name: '张嘉怡',
    position: '市场推广专员',
    joinDate: '2026-06-15',
    departmentId: 'dept-002',
    departmentName: '市场部',
    email: 'zhangjiayi@company.com',
    gender: 'female',
    managerId: 'user-mgr-002',
    managerName: '李娜',
    workstation: 'B-2F-05',
    _missingFields: ['idCard', 'phone'],
  },
  {
    id: 'emp-b1-004',
    batchId: 'batch-001',
    name: '刘子轩',
    position: '品牌策划经理',
    joinDate: '2026-06-15',
    departmentId: 'dept-002',
    departmentName: '市场部',
    phone: '13700137104',
    email: 'liuzixuan@company.com',
    idCard: '440101199212107890',
    gender: 'male',
    managerId: 'user-mgr-002',
    managerName: '李娜',
    workstation: 'B-2F-06',
  },
  {
    id: 'emp-b1-005',
    batchId: 'batch-001',
    name: '陈雨萱',
    position: 'HR专员',
    joinDate: '2026-06-15',
    departmentId: 'dept-003',
    departmentName: '人事部',
    phone: '13700137105',
    email: 'chenyuxuan@company.com',
    idCard: '320101199805053456',
    gender: 'female',
    managerId: 'user-mgr-003',
    managerName: '王芳',
    workstation: 'C-1F-08',
  },
];

export const mockEmployeesBatch2: Employee[] = [
  {
    id: 'emp-b2-001',
    batchId: 'batch-002',
    name: '杨博文',
    position: '产品经理',
    joinDate: '2026-05-20',
    departmentId: 'dept-001',
    departmentName: '技术部',
    phone: '13600136201',
    email: 'yangbowen@company.com',
    idCard: '510101199302288765',
    gender: 'male',
    managerId: 'user-mgr-001',
    managerName: '张伟',
    workstation: 'A-3F-01',
  },
  {
    id: 'emp-b2-002',
    batchId: 'batch-002',
    name: '黄雅婷',
    position: 'UI设计师',
    joinDate: '2026-05-20',
    departmentId: 'dept-001',
    departmentName: '技术部',
    phone: '13600136202',
    email: 'huangyating@company.com',
    idCard: '330101199709155432',
    gender: 'female',
    managerId: 'user-mgr-001',
    managerName: '张伟',
    workstation: 'A-3F-02',
  },
  {
    id: 'emp-b2-003',
    batchId: 'batch-002',
    name: '吴俊杰',
    position: '测试工程师',
    joinDate: '2026-05-20',
    departmentId: 'dept-001',
    departmentName: '技术部',
    phone: '13600136203',
    email: 'wujunjie@company.com',
    idCard: '420101199407082345',
    gender: 'male',
    managerId: 'user-mgr-001',
    managerName: '张伟',
    workstation: 'A-3F-03',
  },
  {
    id: 'emp-b2-004',
    batchId: 'batch-002',
    name: '周诗涵',
    position: '市场分析师',
    joinDate: '2026-05-20',
    departmentId: 'dept-002',
    departmentName: '市场部',
    phone: '13600136204',
    email: 'zhoushihan@company.com',
    idCard: '500101199604209876',
    gender: 'female',
    managerId: 'user-mgr-002',
    managerName: '李娜',
    workstation: 'B-2F-01',
  },
  {
    id: 'emp-b2-005',
    batchId: 'batch-002',
    name: '郑浩然',
    position: '渠道销售经理',
    joinDate: '2026-05-20',
    departmentId: 'dept-002',
    departmentName: '市场部',
    phone: '13600136205',
    email: 'zhenghaoran@company.com',
    idCard: '610101199111118765',
    gender: 'male',
    managerId: 'user-mgr-002',
    managerName: '李娜',
    workstation: 'B-2F-02',
  },
  {
    id: 'emp-b2-006',
    batchId: 'batch-002',
    name: '孙婉清',
    position: '公关专员',
    joinDate: '2026-05-20',
    departmentId: 'dept-002',
    departmentName: '市场部',
    phone: '13600136206',
    email: 'sunwanqing@company.com',
    idCard: '370101199801254321',
    gender: 'female',
    managerId: 'user-mgr-002',
    managerName: '李娜',
    workstation: 'B-2F-03',
  },
  {
    id: 'emp-b2-007',
    batchId: 'batch-002',
    name: '马晓东',
    position: '培训主管',
    joinDate: '2026-05-20',
    departmentId: 'dept-003',
    departmentName: '人事部',
    phone: '13600136207',
    email: 'maxiaodong@company.com',
    idCard: '120101199006187654',
    gender: 'male',
    managerId: 'user-mgr-003',
    managerName: '王芳',
    workstation: 'C-1F-05',
  },
  {
    id: 'emp-b2-008',
    batchId: 'batch-002',
    name: '林美玲',
    position: '薪酬专员',
    joinDate: '2026-05-20',
    departmentId: 'dept-003',
    departmentName: '人事部',
    phone: '13600136208',
    email: 'linmeiling@company.com',
    idCard: '450101199503305678',
    gender: 'female',
    managerId: 'user-mgr-003',
    managerName: '王芳',
    workstation: 'C-1F-06',
  },
];

export const mockEmployees: Employee[] = [...mockEmployeesBatch1, ...mockEmployeesBatch2];

export const mockBatches: Batch[] = [
  {
    id: 'batch-001',
    name: '2026年6月第一批入职',
    createdAt: '2026-06-01T09:00:00Z',
    status: 'importing',
    currentStep: 1,
    progressPercent: 15,
    employeeCount: 5,
    completedTaskCount: 0,
    totalTaskCount: 0,
    startDate: '2026-06-15',
    notes: '包含技术部、市场部、人事部新员工',
  },
  {
    id: 'batch-002',
    name: '2026年5月第二批入职',
    createdAt: '2026-05-10T10:30:00Z',
    status: 'in_progress',
    currentStep: 4,
    progressPercent: 65,
    employeeCount: 8,
    completedTaskCount: 38,
    totalTaskCount: 56,
    startDate: '2026-05-20',
    notes: '春招补录批次，含技术部产品经理1名',
  },
];

function generateTaskId(): string {
  return 'task-' + Math.random().toString(36).slice(2, 10);
}

export const mockTasksBatch2: Task[] = (() => {
  const tasks: Task[] = [];
  const assignees = {
    admin1: mockUsers.find(u => u.id === 'user-admin-001')!,
    admin2: mockUsers.find(u => u.id === 'user-admin-002')!,
    hr: mockUsers.find(u => u.id === 'user-hr-001')!,
    mgr1: mockUsers.find(u => u.id === 'user-mgr-001')!,
    mgr2: mockUsers.find(u => u.id === 'user-mgr-002')!,
    mgr3: mockUsers.find(u => u.id === 'user-mgr-003')!,
  };

  const statuses: Record<string, Task['status']> = {
    'tpl-task-001': 'completed',
    'tpl-task-002': 'completed',
    'tpl-task-003': 'completed',
    'tpl-task-004': 'in_progress',
    'tpl-task-005': 'completed',
    'tpl-task-006': 'completed',
    'tpl-task-007': 'in_progress',
    'tpl-task-008': 'pending',
  };

  const completedAtDates: Record<string, string> = {
    'tpl-task-001': '2026-05-19T10:00:00Z',
    'tpl-task-002': '2026-05-19T16:30:00Z',
    'tpl-task-003': '2026-05-19T11:00:00Z',
    'tpl-task-005': '2026-05-18T15:00:00Z',
    'tpl-task-006': '2026-05-19T14:00:00Z',
  };

  const deptEmployees: Record<string, Employee[]> = {
    'dept-001': mockEmployeesBatch2.filter(e => e.departmentId === 'dept-001'),
    'dept-002': mockEmployeesBatch2.filter(e => e.departmentId === 'dept-002'),
    'dept-003': mockEmployeesBatch2.filter(e => e.departmentId === 'dept-003'),
  };

  mockTaskTemplates.forEach((tpl, index) => {
    const deptManagers: Record<string, User> = {
      'dept-001': assignees.mgr1,
      'dept-002': assignees.mgr2,
      'dept-003': assignees.mgr3,
    };

    Object.entries(deptEmployees).forEach(([deptId, employees]) => {
      if (employees.length === 0) return;

      let assignee: User;
      if (tpl.defaultRole === 'manager') {
        assignee = deptManagers[deptId];
      } else if (tpl.defaultRole === 'hr') {
        assignee = assignees.hr;
      } else {
        assignee = index % 2 === 0 ? assignees.admin1 : assignees.admin2;
      }

      const status = statuses[tpl.id];
      tasks.push({
        id: generateTaskId(),
        batchId: 'batch-002',
        templateId: tpl.id,
        title: tpl.name,
        description: tpl.description,
        employeeIds: employees.map(e => e.id),
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        assigneeRole: assignee.role,
        status,
        priority: tpl.defaultPriority,
        dueDate: '2026-05-' + String(18 + tpl.defaultDueDays).padStart(2, '0'),
        createdAt: '2026-05-10T11:00:00Z',
        completedAt: completedAtDates[tpl.id],
      });
    });
  });

  return tasks;
})();

export const accountItemConfigs: { type: AccountType; typeName: string; defaultRequired: boolean; defaultDepartments: string[] }[] = [
  { type: 'email', typeName: '企业邮箱', defaultRequired: true, defaultDepartments: ['dept-001', 'dept-002', 'dept-003'] },
  { type: 'id_badge', typeName: '员工工牌', defaultRequired: true, defaultDepartments: ['dept-001', 'dept-002', 'dept-003'] },
  { type: 'access_card', typeName: '门禁权限', defaultRequired: true, defaultDepartments: ['dept-001', 'dept-002', 'dept-003'] },
  { type: 'vpn', typeName: 'VPN账号', defaultRequired: true, defaultDepartments: ['dept-001'] },
  { type: 'erp', typeName: 'ERP系统', defaultRequired: true, defaultDepartments: ['dept-002', 'dept-003'] },
  { type: 'oa', typeName: 'OA办公系统', defaultRequired: true, defaultDepartments: ['dept-001', 'dept-002', 'dept-003'] },
  { type: 'other', typeName: '其他账号', defaultRequired: false, defaultDepartments: [] },
];

function generateAccountItemId(): string {
  return 'acc-' + Math.random().toString(36).slice(2, 10);
}

export const mockAccountItemsBatch2: AccountItem[] = (() => {
  const items: AccountItem[] = [];
  mockEmployeesBatch2.forEach((emp) => {
    accountItemConfigs.forEach((config) => {
      if (!config.defaultDepartments.includes(emp.departmentId)) return;
      items.push({
        id: generateAccountItemId(),
        employeeId: emp.id,
        type: config.type,
        typeName: config.typeName,
        required: config.defaultRequired,
        status: ['email', 'id_badge', 'access_card'].includes(config.type) ? 'completed' : 'applying',
        applicant: '孙志强',
        completedAt: ['email', 'id_badge', 'access_card'].includes(config.type) ? '2026-05-19T17:00:00Z' : undefined,
      });
    });
  });
  return items;
})();

export function generateAllMockData() {
  return {
    departments: mockDepartments,
    documentTemplates: mockDocumentTemplates,
    taskTemplates: mockTaskTemplates,
    users: mockUsers,
    batches: mockBatches,
    employees: [...mockEmployeesBatch1, ...mockEmployeesBatch2],
    tasks: mockTasksBatch2,
    accountItems: mockAccountItemsBatch2,
    accountItemConfigs,
  };
}
