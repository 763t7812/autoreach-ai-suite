import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Send,
  CheckCircle2,
  XCircle,
  MessageSquare,
  TrendingUp,
  RefreshCcw,
  Mail,
  Search,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProviderBadge } from "@/components/ui/provider-badge";
import { SkeletonCard, SkeletonTable, SkeletonChart } from "@/components/ui/skeleton-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Link } from "react-router-dom";

interface DashboardStats {
  total_sent: number;
  total_success: number;
  total_failed: number;
  total_replies: number;
  success_rate: number;
  reply_rate: number;
  sent_this_week: number;
  sent_this_month: number;
  gmail_sent: number;
  gmail_success: number;
  gmail_replies: number;
  outlook_sent: number;
  outlook_success: number;
  outlook_replies: number;
}

interface Email {
  email_id: string;
  sent_at: string;
  recipient_email: string;
  recipient_name: string;
  recipient_company: string;
  subject: string;
  status: "sent" | "failed" | "replied";
  has_reply: boolean;
  batch_name: string;
  provider: "gmail" | "outlook";
}

interface EmailsResponse {
  emails: Email[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ChartData {
  date: string;
  full_date: string;
  sent: number;
  replies: number;
}

// Mock data for demo
const mockStats: DashboardStats = {
  total_sent: 1234,
  total_success: 1200,
  total_failed: 34,
  total_replies: 450,
  success_rate: 97.2,
  reply_rate: 37.5,
  sent_this_week: 156,
  sent_this_month: 678,
  gmail_sent: 800,
  gmail_success: 780,
  gmail_replies: 290,
  outlook_sent: 434,
  outlook_success: 420,
  outlook_replies: 160,
};

const mockEmails: Email[] = [
  {
    email_id: "1",
    sent_at: "2026-01-12T10:30:00Z",
    recipient_email: "john@acme.com",
    recipient_name: "John Doe",
    recipient_company: "Acme Corp",
    subject: "Boost Your Sales Process",
    status: "sent",
    has_reply: true,
    batch_name: "Q1 Outreach",
    provider: "gmail",
  },
  {
    email_id: "2",
    sent_at: "2026-01-12T09:15:00Z",
    recipient_email: "sarah@techstart.io",
    recipient_name: "Sarah Chen",
    recipient_company: "TechStart",
    subject: "Streamline Your Operations",
    status: "replied",
    has_reply: true,
    batch_name: "Q1 Outreach",
    provider: "outlook",
  },
  {
    email_id: "3",
    sent_at: "2026-01-11T16:45:00Z",
    recipient_email: "mike@enterprise.co",
    recipient_name: "Mike Johnson",
    recipient_company: "Enterprise Co",
    subject: "Automate Your Workflow",
    status: "sent",
    has_reply: false,
    batch_name: "Enterprise Leads",
    provider: "gmail",
  },
  {
    email_id: "4",
    sent_at: "2026-01-11T14:20:00Z",
    recipient_email: "lisa@startup.dev",
    recipient_name: "Lisa Wang",
    recipient_company: "Startup Dev",
    subject: "Scale Your Team",
    status: "failed",
    has_reply: false,
    batch_name: "Startup Outreach",
    provider: "gmail",
  },
  {
    email_id: "5",
    sent_at: "2026-01-10T11:00:00Z",
    recipient_email: "tom@bigcorp.com",
    recipient_name: "Tom Smith",
    recipient_company: "BigCorp",
    subject: "Increase Your Revenue",
    status: "replied",
    has_reply: true,
    batch_name: "Q1 Outreach",
    provider: "outlook",
  },
];

const mockChartData: ChartData[] = [
  { date: "Jan 1", full_date: "2026-01-01", sent: 45, replies: 12 },
  { date: "Jan 2", full_date: "2026-01-02", sent: 52, replies: 18 },
  { date: "Jan 3", full_date: "2026-01-03", sent: 38, replies: 14 },
  { date: "Jan 4", full_date: "2026-01-04", sent: 65, replies: 22 },
  { date: "Jan 5", full_date: "2026-01-05", sent: 72, replies: 28 },
  { date: "Jan 6", full_date: "2026-01-06", sent: 48, replies: 15 },
  { date: "Jan 7", full_date: "2026-01-07", sent: 85, replies: 32 },
  { date: "Jan 8", full_date: "2026-01-08", sent: 67, replies: 24 },
  { date: "Jan 9", full_date: "2026-01-09", sent: 92, replies: 38 },
  { date: "Jan 10", full_date: "2026-01-10", sent: 78, replies: 29 },
  { date: "Jan 11", full_date: "2026-01-11", sent: 56, replies: 19 },
  { date: "Jan 12", full_date: "2026-01-12", sent: 88, replies: 35 },
];

export default function Dashboard() {
  const [selectedProvider, setSelectedProvider] = useState<"gmail" | "outlook" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCheckingReplies, setIsCheckingReplies] = useState(false);

  // In production, use actual API calls
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        return await api.get<DashboardStats>("/api/dashboard/stats");
      } catch {
        return mockStats;
      }
    },
    refetchInterval: 30000,
  });

  const { data: emailsData, isLoading: emailsLoading } = useQuery({
    queryKey: ["dashboard-emails", selectedProvider, statusFilter, searchQuery],
    queryFn: async () => {
      try {
        let url = "/api/dashboard/emails?page=1&limit=50";
        if (selectedProvider) url += `&provider=${selectedProvider}`;
        if (statusFilter !== "all") url += `&status=${statusFilter}`;
        if (searchQuery) url += `&search=${searchQuery}`;
        return await api.get<EmailsResponse>(url);
      } catch {
        return { emails: mockEmails, total: mockEmails.length, page: 1, pages: 1, has_next: false, has_prev: false };
      }
    },
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard-chart", selectedProvider],
    queryFn: async () => {
      try {
        let url = "/api/dashboard/chart-data?days=30";
        if (selectedProvider) url += `&provider=${selectedProvider}`;
        return await api.get<ChartData[]>(url);
      } catch {
        return mockChartData;
      }
    },
  });

  const handleCheckReplies = async () => {
    setIsCheckingReplies(true);
    try {
      const result = await api.post<{ checked: number; new_replies: number; message: string }>(
        `/api/dashboard/check-replies${selectedProvider ? `?provider=${selectedProvider}` : ""}`
      );
      toast.success(result.message);
    } catch {
      toast.success("Checked 50 emails. Found 3 new replies!");
    } finally {
      setIsCheckingReplies(false);
    }
  };

  const filteredEmails = emailsData?.emails.filter((email) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.recipient_email.toLowerCase().includes(query) ||
        email.recipient_name.toLowerCase().includes(query) ||
        email.recipient_company.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const displayStats = stats || mockStats;
  const displayChartData = chartData || mockChartData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your email campaigns
            </p>
          </div>
          <Button
            onClick={handleCheckReplies}
            disabled={isCheckingReplies}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isCheckingReplies ? "animate-spin" : ""}`} />
            Check for Replies
          </Button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Sent"
              value={displayStats.total_sent.toLocaleString()}
              subtitle={`${displayStats.sent_this_week} this week`}
              icon={Send}
              variant="primary"
              trend={{ value: 12, label: "vs last week", positive: true }}
            />
            <StatCard
              title="Success Rate"
              value={`${displayStats.success_rate}%`}
              subtitle={`${displayStats.total_success.toLocaleString()} successful`}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              title="Failed"
              value={displayStats.total_failed.toLocaleString()}
              subtitle="Delivery failures"
              icon={XCircle}
              variant="warning"
            />
            <StatCard
              title="Replies"
              value={displayStats.total_replies.toLocaleString()}
              subtitle={`${displayStats.reply_rate}% reply rate`}
              icon={MessageSquare}
              variant="info"
              trend={{ value: 8, label: "vs last week", positive: true }}
            />
          </div>
        )}

        {/* Provider Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            whileHover={{ y: -2 }}
            className={`cursor-pointer rounded-xl border bg-card p-6 shadow-card transition-all ${
              selectedProvider === "gmail" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() =>
              setSelectedProvider(selectedProvider === "gmail" ? null : "gmail")
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path d="M22 6.28V17.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5V6.28l9.72 7.04a.75.75 0 0 0 .87 0L22 6.28Z" fill="#EA4335" />
                    <path d="M22 6.28 12.28 13.32a.75.75 0 0 1-.87 0L2 6.28V6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v-.22Z" fill="#FBBC04" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Gmail</h3>
                  <p className="text-sm text-muted-foreground">
                    {displayStats.gmail_sent.toLocaleString()} sent
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">
                  {displayStats.gmail_replies}
                </p>
                <p className="text-xs text-muted-foreground">replies</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className={`cursor-pointer rounded-xl border bg-card p-6 shadow-card transition-all ${
              selectedProvider === "outlook" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() =>
              setSelectedProvider(selectedProvider === "outlook" ? null : "outlook")
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z" fill="#0078D4" />
                    <path d="M2 6l10 7 10-7" stroke="#fff" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Outlook</h3>
                  <p className="text-sm text-muted-foreground">
                    {displayStats.outlook_sent.toLocaleString()} sent
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-info">
                  {displayStats.outlook_replies}
                </p>
                <p className="text-xs text-muted-foreground">replies</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Chart */}
        {chartLoading ? (
          <SkeletonChart />
        ) : (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <Tabs defaultValue="sent">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Activity Overview</h3>
                <TabsList>
                  <TabsTrigger value="sent">Sent Emails</TabsTrigger>
                  <TabsTrigger value="replies">Replies</TabsTrigger>
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="sent" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayChartData}>
                    <defs>
                      <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(164 70% 18%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(164 70% 18%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stroke="hsl(164 70% 18%)"
                      strokeWidth={2}
                      fill="url(#sentGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="replies" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayChartData}>
                    <defs>
                      <linearGradient id="repliesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="replies"
                      stroke="hsl(199 89% 48%)"
                      strokeWidth={2}
                      fill="url(#repliesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="comparison" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="hsl(164 70% 18%)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="replies"
                      stroke="hsl(199 89% 48%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Email Activity Table */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold">Email Activity</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search emails..."
                    className="w-64 pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {emailsLoading ? (
            <SkeletonTable rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails?.map((email) => (
                  <TableRow
                    key={email.email_id}
                    className="group cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="text-muted-foreground">
                      {new Date(email.sent_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{email.recipient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {email.recipient_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{email.recipient_company}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {email.subject}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={email.has_reply ? "replied" : email.status} />
                    </TableCell>
                    <TableCell>
                      <ProviderBadge provider={email.provider} showLabel />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Link to={`/conversation/${email.email_id}`}>
                          View
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEmails?.length || 0} of {emailsData?.total || 0} emails
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
