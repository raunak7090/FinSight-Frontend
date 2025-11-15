import { Home, ArrowLeftRight, Target, MessageSquare, User, LogOut, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Budget Goals', href: '/goals', icon: Target },
  { name: 'AI Insights', href: '/insights', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isMobileOpen) return;
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onMobileClose}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-lg transition-transform duration-200 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:shadow-none'
        )}
      >
        <div className="p-6 border-b border-sidebar-border relative">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FinSight
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Smart Money Management</p>

          <button
            type="button"
            onClick={onMobileClose}
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'transition-all duration-200'
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
