import { Link, useLocation } from 'react-router-dom';
import {
  House,
  Book,
  Users,
  PlusCircle,
  ChatCircle,
  Certificate,
  ChartBar,
  MagnifyingGlass,
  X,
  Gear,
  CaretUpDown,
  Buildings,
  Folder,
  Command,
  CaretRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' }>;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' }>;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    label: 'Plataforma',
    icon: Command,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: House },
      { title: 'Utilizadores', href: '/users', icon: Users },
      { title: 'Cursos', href: '/courses', icon: Book },
      { title: 'Relatórios', href: '/reports', icon: ChartBar },
    ],
  },
  {
    label: 'Configurações',
    icon: Gear,
    items: [
      { title: 'Definições', href: '/settings', icon: Gear },
    ],
  },
];

const teacherNavGroups: NavGroup[] = [
  {
    label: 'Plataforma',
    icon: Command,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: House },
      { title: 'Os Meus Cursos', href: '/my-courses', icon: Book },
      { title: 'Criar Curso', href: '/create-course', icon: PlusCircle },
      { title: 'Mensagens', href: '/messages', icon: ChatCircle },
    ],
  },
];

const studentNavGroups: NavGroup[] = [
  {
    label: 'Plataforma',
    icon: Command,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: House },
      { title: 'Os Meus Cursos', href: '/my-courses', icon: Book },
      { title: 'Explorar', href: '/explore', icon: MagnifyingGlass },
      { title: 'Certificados', href: '/certificates', icon: Certificate },
    ],
  },
];

function NavGroupSection({ group, onClose }: { group: NavGroup; onClose: () => void }) {
  const location = useLocation();
  const hasActiveItem = group.items.some(item => location.pathname === item.href);
  const [isOpen, setIsOpen] = useState(hasActiveItem);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted">
        <div className="flex items-center gap-2">
          <group.icon className="h-4 w-4" weight="regular" />
          <span>{group.label}</span>
        </div>
        <CaretRight 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )} 
          weight="bold" 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-0.5 pl-4">
        {group.items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" weight={isActive ? 'fill' : 'regular'} />
              {item.title}
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { role, profile } = useAuth();

  const navGroups = role === 'admin' 
    ? adminNavGroups 
    : role === 'teacher' 
    ? teacherNavGroups 
    : studentNavGroups;

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
        {/* Company Header */}
        <div className="flex h-14 items-center justify-between border-b px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-sm p-1.5 text-left hover:bg-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
                  <Buildings className="h-4 w-4 text-primary-foreground" weight="fill" />
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-semibold">Academia</p>
                  <p className="truncate text-xs text-muted-foreground">Enterprise</p>
                </div>
                <CaretUpDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <Buildings className="mr-2 h-4 w-4" />
                Academia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {navGroups.map((group) => (
            <NavGroupSection key={group.label} group={group} onClose={onClose} />
          ))}
          
          {/* Projects section example */}
          <div className="pt-2">
            <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Projetos</p>
            <div className="space-y-0.5">
              <Link
                to="/projects/design"
                onClick={onClose}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
              >
                <Folder className="h-4 w-4" weight="regular" />
                Design Engineering
              </Link>
              <Link
                to="/projects/sales"
                onClick={onClose}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
              >
                <Folder className="h-4 w-4" weight="regular" />
                Sales & Marketing
              </Link>
            </div>
          </div>
        </nav>

        {/* User Footer */}
        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-sm p-1.5 text-left hover:bg-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-medium">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{profile?.full_name || 'Utilizador'}</p>
                  <p className="truncate text-xs text-muted-foreground">{profile?.email || ''}</p>
                </div>
                <CaretUpDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <Users className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Gear className="mr-2 h-4 w-4" />
                  Definições
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
