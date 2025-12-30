import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  PlusCircle,
  MessageSquare,
  Award,
  BarChart3,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Utilizadores', href: '/users', icon: Users },
  { title: 'Cursos', href: '/courses', icon: BookOpen },
  { title: 'Relatórios', href: '/reports', icon: BarChart3 },
];

const teacherNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Os Meus Cursos', href: '/my-courses', icon: BookOpen },
  { title: 'Criar Curso', href: '/create-course', icon: PlusCircle },
  { title: 'Mensagens', href: '/messages', icon: MessageSquare },
];

const studentNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Os Meus Cursos', href: '/my-courses', icon: BookOpen },
  { title: 'Explorar', href: '/explore', icon: Search },
  { title: 'Certificados', href: '/certificates', icon: Award },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { role } = useAuth();

  const navItems = role === 'admin' 
    ? adminNavItems 
    : role === 'teacher' 
    ? teacherNavItems 
    : studentNavItems;

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="rounded-sm bg-muted p-4">
            <p className="text-sm font-medium">
              Precisa de ajuda?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Consulte a nossa documentação ou contacte o suporte.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Ver Ajuda
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
