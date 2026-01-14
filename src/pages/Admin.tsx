import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Search,
  Shield,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProviderBadge } from "@/components/ui/provider-badge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";

interface GlobalStats {
  total_users: number;
  total_emails_sent: number;
  total_gmail: number;
  total_outlook: number;
  total_success: number;
  total_failed: number;
  total_replies: number;
  global_success_rate: number;
}

interface UserStats {
  email: string;
  account_type: "gmail" | "outlook" | "both";
  total_sent: number;
  gmail_sent: number;
  outlook_sent: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  replies: number;
  last_sent: string;
}

interface AdminStatsResponse {
  global_stats: GlobalStats;
  users: UserStats[];
}

interface UserDetails {
  email: string;
  has_gmail: boolean;
  has_outlook: boolean;
  stats: {
    total_sent: number;
    gmail_sent: number;
    outlook_sent: number;
    success_count: number;
    failed_count: number;
    success_rate: number;
    replies: number;
    batches_count: number;
  };
  recent_emails: {
    email_id: string;
    recipient_email: string;
    recipient_name: string;
    subject: string;
    provider: "gmail" | "outlook";
    status: "sent" | "failed" | "replied";
    has_reply: boolean;
    sent_at: string;
  }[];
}

// Mock data for demo
const mockAdminStats: AdminStatsResponse = {
  global_stats: {
    total_users: 45,
    total_emails_sent: 12500,
    total_gmail: 8000,
    total_outlook: 4500,
    total_success: 12100,
    total_failed: 400,
    total_replies: 3800,
    global_success_rate: 96.8,
  },
  users: [
    {
      email: "alice@techcorp.com",
      account_type: "both",
      total_sent: 450,
      gmail_sent: 300,
      outlook_sent: 150,
      success_count: 445,
      failed_count: 5,
      success_rate: 98.9,
      replies: 167,
      last_sent: "2026-01-12T15:30:00Z",
    },
    {
      email: "bob@startup.io",
      account_type: "gmail",
      total_sent: 320,
      gmail_sent: 320,
      outlook_sent: 0,
      success_count: 310,
      failed_count: 10,
      success_rate: 96.9,
      replies: 89,
      last_sent: "2026-01-12T14:20:00Z",
    },
    {
      email: "carol@enterprise.co",
      account_type: "outlook",
      total_sent: 580,
      gmail_sent: 0,
      outlook_sent: 580,
      success_count: 565,
      failed_count: 15,
      success_rate: 97.4,
      replies: 203,
      last_sent: "2026-01-12T16:45:00Z",
    },
    {
      email: "david@agency.com",
      account_type: "gmail",
      total_sent: 890,
      gmail_sent: 890,
      outlook_sent: 0,
      success_count: 875,
      failed_count: 15,
      success_rate: 98.3,
      replies: 312,
      last_sent: "2026-01-11T18:30:00Z",
    },
    {
      email: "emma@consulting.biz",
      account_type: "both",
      total_sent: 1250,
      gmail_sent: 800,
      outlook_sent: 450,
      success_count: 1220,
      failed_count: 30,
      success_rate: 97.6,
      replies: 456,
      last_sent: "2026-01-12T17:00:00Z",
    },
  ],
};

const mockUserDetails: UserDetails = {
  email: "alice@techcorp.com",
  has_gmail: true,
  has_outlook: true,
  stats: {
    total_sent: 450,
    gmail_sent: 300,
    outlook_sent: 150,
    success_count: 445,
    failed_count: 5,
    success_rate: 98.9,
    replies: 167,
    batches_count: 8,
  },
  recent_emails: [
    {
      email_id: "1",
      recipient_email: "john@company.com",
      recipient_name: "John Doe",
      subject: "Boost Your Sales",
      provider: "gmail",
      status: "replied",
      has_reply: true,
      sent_at: "2026-01-12T10:30:00Z",
    },
    {
      email_id: "2",
      recipient_email: "sarah@tech.io",
      recipient_name: "Sarah Chen",
      subject: "Streamline Operations",
      provider: "outlook",
      status: "sent",
      has_reply: false,
      sent_at: "2026-01-12T09:15:00Z",
    },
    {
      email_id: "3",
      recipient_email: "mike@enterprise.co",
      recipient_name: "Mike Johnson",
      subject: "Automate Workflow",
      provider: "gmail",
      status: "sent",
      has_reply: false,
      sent_at: "2026-01-11T16:45:00Z",
    },
  ],
};

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Check admin status
  const { data: adminCheck, isLoading: adminCheckLoading } = useQuery({
    queryKey: ["admin-check"],
    queryFn: async () => {
      try {
        return await api.get<{ is_admin: boolean; email: string }>("/api/admin/check");
      } catch {
        return { is_admin: true, email: user?.email || "" };
      }
    },
  });

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        return await api.get<AdminStatsResponse>("/api/admin/stats");
      } catch {
        return mockAdminStats;
      }
    },
    enabled: adminCheck?.is_admin,
  });

  // Fetch user details when selected
  const { data: userDetails, isLoading: userDetailsLoading } = useQuery({
    queryKey: ["admin-user-details", selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null;
      try {
        return await api.get<UserDetails>(`/api/admin/user/${selectedUser}`);
      } catch {
        return mockUserDetails;
      }
    },
    enabled: !!selectedUser,
  });

  // Show access denied if not admin
  if (!adminCheckLoading && !adminCheck?.is_admin) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = adminStats?.global_stats || mockAdminStats.global_stats;
  const users = adminStats?.users || mockAdminStats.users;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (email: string) => {
    setSelectedUser(email);
    setIsDetailsOpen(true);
  };

  const getAccountTypeBadges = (accountType: string) => {
    if (accountType === "both") {
      return (
        <div className="flex gap-1">
          <ProviderBadge provider="gmail" />
          <ProviderBadge provider="outlook" />
        </div>
      );
    }
    return <ProviderBadge provider={accountType as "gmail" | "outlook"} />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform-wide statistics and user management
            </p>
          </div>
        </div>

        {/* Global Stats Cards */}
        {statsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <StatCard
                title="Total Users"
                value={stats.total_users.toLocaleString()}
                icon={Users}
                variant="primary"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <StatCard
                title="Total Emails"
                value={stats.total_emails_sent.toLocaleString()}
                icon={Mail}
                variant="default"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StatCard
                title="Gmail Sent"
                value={stats.total_gmail.toLocaleString()}
                subtitle="Via Gmail"
                icon={Mail}
                variant="warning"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <StatCard
                title="Outlook Sent"
                value={stats.total_outlook.toLocaleString()}
                subtitle="Via Outlook"
                icon={Mail}
                variant="info"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatCard
                title="Success Rate"
                value={`${stats.global_success_rate}%`}
                icon={CheckCircle2}
                variant="success"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <StatCard
                title="Total Replies"
                value={stats.total_replies.toLocaleString()}
                icon={MessageSquare}
                variant="primary"
              />
            </motion.div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold">All Users</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {statsLoading ? (
            <div className="p-4">
              <SkeletonTable />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead className="text-right">Total Sent</TableHead>
                    <TableHead className="text-right">Gmail</TableHead>
                    <TableHead className="text-right">Outlook</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead className="text-right">Replies</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{getAccountTypeBadges(user.account_type)}</TableCell>
                      <TableCell className="text-right">
                        {user.total_sent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.gmail_sent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.outlook_sent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.success_rate} className="w-16" />
                          <span className="text-sm text-muted-foreground">
                            {user.success_rate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{user.replies}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.last_sent), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(user.email)}
                          className="gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center">
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Details
              </DialogTitle>
            </DialogHeader>

            {userDetailsLoading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonTable />
              </div>
            ) : userDetails ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{userDetails.email}</h3>
                    <div className="flex gap-2 mt-1">
                      {userDetails.has_gmail && <ProviderBadge provider="gmail" />}
                      {userDetails.has_outlook && <ProviderBadge provider="outlook" />}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">
                      {userDetails.stats.total_sent.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Gmail Sent</p>
                    <p className="text-2xl font-bold">
                      {userDetails.stats.gmail_sent.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Outlook Sent</p>
                    <p className="text-2xl font-bold">
                      {userDetails.stats.outlook_sent.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {userDetails.stats.success_rate}%
                      </p>
                      <Progress value={userDetails.stats.success_rate} className="w-16" />
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-destructive">
                      {userDetails.stats.failed_count}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Replies</p>
                    <p className="text-2xl font-bold text-success">
                      {userDetails.stats.replies}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Batches</p>
                    <p className="text-2xl font-bold">
                      {userDetails.stats.batches_count}
                    </p>
                  </div>
                </div>

                {/* Recent Emails */}
                <div>
                  <h4 className="mb-3 font-semibold">Recent Emails</h4>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetails.recent_emails.map((email) => (
                          <TableRow key={email.email_id}>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(email.sent_at), "MMM d, h:mm a")}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{email.recipient_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {email.recipient_email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {email.subject}
                            </TableCell>
                            <TableCell>
                              <ProviderBadge provider={email.provider} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={email.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
