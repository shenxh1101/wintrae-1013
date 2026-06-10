import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileCode,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import TopNavbar from './TopNavbar';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/batches', label: '批次管理', icon: Layers },
  { path: '/templates', label: '模板管理', icon: FileCode },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export default function AppLayout() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 960);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slatebg-200">
      <div className="h-16 flex items-center justify-between px-5 border-b border-slatebg-200">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && !isMobile && 'justify-center w-full')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center flex-shrink-0 shadow-md">
            <Briefcase className="w-5 h-5 text-copper-400" />
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-serif font-bold text-navy-800 text-base leading-tight">入职材料</span>
              <span className="font-serif font-bold text-navy-800 text-base leading-tight">自动化工具</span>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-slatebg-100 text-navy-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-navy-800 text-white shadow-md'
                  : 'text-navy-600 hover:bg-slatebg-100 hover:text-navy-800',
                sidebarCollapsed && !isMobile && 'justify-center px-2'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-copper-500 rounded-r-full" />
              )}
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                active ? 'text-copper-400' : 'text-navy-500 group-hover:text-navy-700'
              )} />
              {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        'border-t border-slatebg-200 p-4',
        sidebarCollapsed && !isMobile && 'px-2'
      )}>
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slatebg-50 to-slatebg-100',
          sidebarCollapsed && !isMobile && 'justify-center'
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
            刘
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy-800 text-sm truncate">刘晓梅</p>
              <p className="text-xs text-navy-500 truncate">HR专员</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slatebg-100">
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-navy-950/50 z-40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex-shrink-0 transition-all duration-300 ease-in-out z-50',
          isMobile
            ? cn(
                'fixed inset-y-0 left-0 w-64 transform',
                mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
              )
            : sidebarCollapsed
            ? 'w-20'
            : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(30deg, transparent 40%, rgba(30, 58, 95, 0.03) 40%, rgba(30, 58, 95, 0.03) 60%, transparent 60%),
              linear-gradient(150deg, transparent 40%, rgba(212, 165, 116, 0.02) 40%, rgba(212, 165, 116, 0.02) 60%, transparent 60%),
              linear-gradient(30deg, transparent 45%, rgba(30, 58, 95, 0.02) 45%, rgba(30, 58, 95, 0.02) 55%, transparent 55%)
            `,
            backgroundSize: '60px 60px, 80px 80px, 40px 40px',
          }}
        />

        {isMobile && (
          <div className="h-14 flex items-center px-4 bg-white/80 backdrop-blur-md border-b border-slatebg-200 relative z-10">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slatebg-100 text-navy-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-3 font-serif font-bold text-navy-800">入职材料自动化工具</div>
          </div>
        )}

        {!isMobile && (
          <div className="relative z-10">
            <TopNavbar
              onToggleSidebar={toggleSidebar}
              sidebarCollapsed={sidebarCollapsed}
              toggleIcon={sidebarCollapsed ? ChevronRight : ChevronLeft}
            />
          </div>
        )}

        <main className="flex-1 overflow-auto relative z-0 p-6 lg:p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
