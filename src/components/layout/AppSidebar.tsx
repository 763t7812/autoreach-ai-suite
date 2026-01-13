import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Layers,
  FileSpreadsheet,
  Upload,
  List,
  Shield,
  Settings,
  LogOut,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Single Analysis", href: "/analyze" },
];

const batchNavItems = [
  { icon: FileSpreadsheet, label: "Google Sheets Import", href: "/batches/sheets" },
  { icon: Upload, label: "CSV/Excel Upload", href: "/batches/upload" },
  { icon: List, label: "View All Batches", href: "/batches" },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [batchOpen, setBatchOpen] = useState(
    location.pathname.startsWith("/batch")
  );

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-accent">
          <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold text-sidebar-accent-foreground">
            AutoReach AI
          </h1>
          <p className="text-xs text-sidebar-foreground/60">Email Automation</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {/* Main Nav */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>

        {/* Batch Campaigns Section */}
        <Collapsible open={batchOpen} onOpenChange={setBatchOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname.startsWith("/batch")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Layers className="h-5 w-5" />
              <span>Batch Campaigns</span>
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  batchOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
              {batchNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={location.pathname === item.href}
                  small
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Admin Link */}
        {user?.is_admin && (
          <NavLink
            href="/admin"
            icon={Shield}
            label="Admin"
            isActive={location.pathname === "/admin"}
          />
        )}

        {/* Settings */}
        <NavLink
          href="/settings"
          icon={Settings}
          label="Settings"
          isActive={location.pathname === "/settings"}
        />
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
              {user?.email || "User"}
            </p>
            <div className="flex gap-1">
              {user?.has_gmail_scope && (
                <span className="text-[10px] text-sidebar-primary">Gmail</span>
              )}
              {user?.has_gmail_scope && user?.has_outlook && (
                <span className="text-[10px] text-sidebar-foreground/50">•</span>
              )}
              {user?.has_outlook && (
                <span className="text-[10px] text-info">Outlook</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  small?: boolean;
}

function NavLink({ href, icon: Icon, label, isActive, small }: NavLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 transition-colors",
        small ? "py-2 text-xs" : "py-2.5 text-sm font-medium",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <Icon className={cn("relative z-10", small ? "h-4 w-4" : "h-5 w-5")} />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}
