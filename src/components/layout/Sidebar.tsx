import { Home, ArrowLeftRight, Target, MessageSquare, User, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Budget Goals', href: '/goals', icon: Target },
  { name: 'AI Insights', href: '/insights', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          FinSight
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Smart Money Management</p>
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
    </motion.div>
  );
}
