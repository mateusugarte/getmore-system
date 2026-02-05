import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Kanban,
  Target,
  Users,
  Receipt,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Crown,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Cobranças", href: "/cobrancas", icon: Receipt },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Assinatura", href: "/assinatura", icon: Crown },
];

interface AppSidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AppSidebar = ({ isDarkMode, onToggleTheme }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut, user } = useAuth();

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Perfil atualizado!");
      setSettingsOpen(false);
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => {
    setProfileData({
      full_name: profile?.full_name || "",
      email: profile?.email || user?.email || "",
      phone: profile?.phone || "",
    });
    setSettingsOpen(true);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 60 : 200 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center px-3 border-b border-sidebar-border">
          <motion.div
            animate={{ opacity: 1 }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className={cn(
                  "object-contain transition-all duration-200",
                  collapsed ? "h-8 w-8" : "h-12 w-12"
                )}
              />
            </div>
          </motion.div>
        </div>

        {/* Collapse Toggle */}
        <div className="absolute top-4 right-0 translate-x-1/2 z-10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-sidebar border border-sidebar-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground shadow-sm"
          >
            {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
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
                    ? "bg-gradient-gold-metallic text-gold-foreground shadow-gold"
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
            {isDarkMode ? <Sun size={16} className="text-gold" /> : <Moon size={16} />}
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
                <Avatar className="h-7 w-7 border border-gold/30">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gold/10 text-gold text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || "Usuário"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {profile?.email || user?.email}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={openSettings}>
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

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Configurações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Avatar className="h-16 w-16 border-2 border-gold/30">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gold/10 text-gold text-xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome Completo</Label>
              <Input
                className="h-9 text-sm"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                className="h-9 text-sm"
                value={profileData.email}
                disabled
              />
              <p className="text-[10px] text-muted-foreground">Email não pode ser alterado</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone</Label>
              <Input
                className="h-9 text-sm"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <Button className="w-full h-9 text-sm" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
