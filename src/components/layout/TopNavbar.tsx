import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Home,
  Layers,
  FileCode,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  toggleIcon: LucideIcon;
}

const routeConfig: Record<string, { label: string; parent?: { label: string; path: string } }> = {
  '/': { label: '仪表盘' },
  '/batches': { label: '批次管理' },
  '/templates': { label: '模板管理' },
  '/settings': { label: '系统设置' },
};

export default function TopNavbar({
  onToggleSidebar,
  sidebarCollapsed,
  toggleIcon: ToggleIcon,
}: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const basePath = '/' + (pathSegments[0] || '');
    const config = routeConfig[basePath] || { label: '首页' };

    const crumbs: { label: string; path?: string; icon?: LucideIcon }[] = [
      { label: '首页', path: '/', icon: Home },
    ];

    if (basePath !== '/') {
      crumbs.push({ label: config.label, path: basePath });
    }

    if (pathSegments.length > 1) {
      const id = pathSegments[1];
      crumbs.push({ label: `批次详情: ${id.slice(0, 8)}...` });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumb();
  const Icon = sidebarCollapsed ? Layers : ToggleIcon;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/75 backdrop-blur-xl border-b border-slatebg-200">
      <div className="h-full px-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
              'hover:bg-slatebg-100 active:bg-slatebg-200 text-navy-700',
              sidebarCollapsed && 'text-copper-600 hover:text-navy-700'
            )}
          >
            <Icon className="w-5 h-5" />
          </button>

          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, idx) => {
              const CrumbIcon = crumb.icon;
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  {crumb.path && !isLast ? (
                    <Link
                      to={crumb.path}
                      className="flex items-center gap-1.5 text-navy-500 hover:text-navy-700 transition-colors"
                    >
                      {CrumbIcon && <CrumbIcon className="w-4 h-4" />}
                      <span>{crumb.label}</span>
                    </Link>
                  ) : (
                    <span className={cn(
                      'flex items-center gap-1.5',
                      isLast ? 'text-navy-800 font-semibold' : 'text-navy-500'
                    )}>
                      {CrumbIcon && <CrumbIcon className="w-4 h-4" />}
                      <span>{crumb.label}</span>
                    </span>
                  )}
                  {!isLast && (
                    <ChevronDown className="w-3.5 h-3.5 text-navy-300 -rotate-90" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-400 group-focus-within:text-copper-500 transition-colors" />
            <input
              type="text"
              placeholder="搜索批次名称、员工姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border-2 border-transparent',
                'bg-slatebg-100 text-navy-800 placeholder-navy-400',
                'focus:outline-none focus:border-copper-400 focus:bg-white focus:shadow-lg focus:shadow-copper-100',
                'transition-all duration-200'
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                showNotifications
                  ? 'bg-slatebg-200 text-navy-800'
                  : 'text-navy-600 hover:bg-slatebg-100 hover:text-navy-800'
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-danger-500 rounded-full border-2 border-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slatebg-200 animate-slide-in overflow-hidden">
                <div className="px-5 py-4 border-b border-slatebg-200 flex items-center justify-between">
                  <h3 className="font-semibold text-navy-800">通知中心</h3>
                  <span className="text-xs text-danger-600 font-medium">5 条未读</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="px-5 py-3.5 border-b border-slatebg-100 hover:bg-slatebg-50 cursor-pointer transition-colors"
                    >
                      <p className="text-sm text-navy-800 font-medium mb-1">
                        批次 2026年6月第一批 待处理
                      </p>
                      <p className="text-xs text-navy-500">{i}小时前</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<Plus className="w-4.5 h-4.5" />}
            onClick={() => navigate('/batches/new')}
            className="hidden sm:inline-flex"
          >
            创建批次
          </Button>

          <div className="relative ml-1">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slatebg-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                刘
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 text-navy-500 transition-transform duration-200',
                showUserMenu && 'rotate-180'
              )} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slatebg-200 animate-slide-in overflow-hidden">
                <div className="px-5 py-4 border-b border-slatebg-200 bg-gradient-to-r from-slatebg-50 to-white">
                  <p className="font-semibold text-navy-800">刘晓梅</p>
                  <p className="text-sm text-navy-500">liuxiaomei@company.com</p>
                  <span className="inline-flex mt-2 px-2 py-0.5 text-xs bg-navy-100 text-navy-700 rounded-full">
                    HR专员
                  </span>
                </div>
                <div className="py-2">
                  <button className="w-full px-5 py-2.5 flex items-center gap-3 text-sm text-navy-700 hover:bg-slatebg-50 transition-colors">
                    <UserIcon className="w-4 h-4 text-navy-500" />
                    个人资料
                  </button>
                  <button className="w-full px-5 py-2.5 flex items-center gap-3 text-sm text-navy-700 hover:bg-slatebg-50 transition-colors">
                    <Settings className="w-4 h-4 text-navy-500" />
                    账户设置
                  </button>
                  <div className="my-2 border-t border-slatebg-100" />
                  <button className="w-full px-5 py-2.5 flex items-center gap-3 text-sm text-danger-600 hover:bg-danger-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
