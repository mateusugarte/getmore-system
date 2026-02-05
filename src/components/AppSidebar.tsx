import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";

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
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || "U";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-3">
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
            />
          </div>
        </motion.div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon size={16} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-2 py-1">
        <button
          onClick={onToggleTheme}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150",
            "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          {isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
          {!collapsed && <span>{isDarkMode ? "Claro" : "Escuro"}</span>}
        </button>
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="h-7 w-7 border border-border">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {profile?.email}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Settings className="mr-2 h-3.5 w-3.5" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
};
