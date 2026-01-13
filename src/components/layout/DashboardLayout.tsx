import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { token, user, setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        // Check user scopes and admin status
        const [scopesRes, adminRes] = await Promise.all([
          api.get<{
            email: string;
            has_gmail_scope: boolean;
            has_sheets_scope: boolean;
            has_outlook: boolean;
          }>("/auth/check-scopes"),
          api.get<{ is_admin: boolean }>("/api/admin/check").catch(() => ({ is_admin: false })),
        ]);

        setUser({
          email: scopesRes.email,
          has_gmail_scope: scopesRes.has_gmail_scope,
          has_sheets_scope: scopesRes.has_sheets_scope,
          has_outlook: scopesRes.has_outlook,
          is_admin: adminRes.is_admin,
        });
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, navigate, setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 pl-64">
        <TopHeader />
        <main className="min-h-[calc(100vh-4rem)] p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
