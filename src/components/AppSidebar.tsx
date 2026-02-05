import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Kanban,
  Target,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Clientes", href: "/clientes", icon: Users },
];

interface AppSidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AppSidebar = ({ isDarkMode, onToggleTheme }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-rose shadow-glow">
            <span className="text-lg font-bold text-primary-foreground">G</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-semibold text-gradient-rose">GestãoPro</span>
          )}
        </motion.div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 py-2">
        <button
          onClick={onToggleTheme}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
            "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span>{isDarkMode ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-sidebar-accent",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  U
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground">Usuário</p>
                  <p className="text-xs text-muted-foreground">usuario@email.com</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
};
