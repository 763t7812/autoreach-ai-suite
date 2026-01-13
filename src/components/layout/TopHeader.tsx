import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Moon, Sun, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [hasNotifications] = useState(true);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-lg">
      {/* Search */}
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 pr-12"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </motion.div>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <p className="text-xs text-muted-foreground">
                You have 3 new replies
              </p>
            </div>
            <DropdownMenuItem className="p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">New reply from John Doe</p>
                <p className="text-xs text-muted-foreground">
                  "Thanks for reaching out..."
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Batch completed</p>
                <p className="text-xs text-muted-foreground">
                  Q1 Outreach - 145/150 successful
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-3 border-b">
              <p className="text-sm font-medium">{user?.email}</p>
              <div className="flex gap-2 mt-1">
                {user?.has_gmail_scope && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">
                    Gmail
                  </span>
                )}
                {user?.has_outlook && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/10 text-info">
                    Outlook
                  </span>
                )}
              </div>
            </div>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Connected Accounts</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
