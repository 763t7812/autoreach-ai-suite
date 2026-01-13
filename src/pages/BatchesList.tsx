import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  FileSpreadsheet,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Batch {
  batch_id: string;
  spreadsheet_name: string;
  created_at: string;
  status: "processing" | "completed" | "failed";
  total_leads: number;
  processed: number;
  succeeded: number;
  failed: number;
}

// Mock data
const mockBatches: Batch[] = [
  {
    batch_id: "batch-1",
    spreadsheet_name: "Q1 Outreach Campaign",
    created_at: "2026-01-12T09:00:00Z",
    status: "completed",
    total_leads: 150,
    processed: 150,
    succeeded: 145,
    failed: 5,
  },
  {
    batch_id: "batch-2",
    spreadsheet_name: "Enterprise Leads - January",
    created_at: "2026-01-11T14:30:00Z",
    status: "processing",
    total_leads: 75,
    processed: 45,
    succeeded: 43,
    failed: 2,
  },
  {
    batch_id: "batch-3",
    spreadsheet_name: "Startup Outreach",
    created_at: "2026-01-10T11:15:00Z",
    status: "completed",
    total_leads: 200,
    processed: 200,
    succeeded: 188,
    failed: 12,
  },
  {
    batch_id: "batch-4",
    spreadsheet_name: "Tech Companies List",
    created_at: "2026-01-09T16:45:00Z",
    status: "failed",
    total_leads: 50,
    processed: 23,
    succeeded: 20,
    failed: 3,
  },
];

export default function BatchesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: batches, isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      try {
        return await api.get<Batch[]>("/batches");
      } catch {
        return mockBatches;
      }
    },
  });

  const filteredBatches = batches?.filter((batch) => {
    const matchesSearch = batch.spreadsheet_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-info animate-pulse" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Batch Campaigns</h1>
            <p className="text-muted-foreground">
              Manage and monitor your email campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/batches/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Link>
            </Button>
            <Button asChild>
              <Link to="/batches/sheets">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import Sheets
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Batches Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-card">
                <div className="space-y-4">
                  <div className="h-5 w-3/4 rounded shimmer" />
                  <div className="h-4 w-1/2 rounded shimmer" />
                  <div className="h-2 w-full rounded shimmer" />
                  <div className="flex justify-between">
                    <div className="h-4 w-16 rounded shimmer" />
                    <div className="h-4 w-16 rounded shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBatches?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Layers className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No campaigns found</h3>
            <p className="mb-6 text-center text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first batch campaign to get started"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/batches/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </Link>
              </Button>
              <Button asChild>
                <Link to="/batches/sheets">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Import Sheets
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBatches?.map((batch, index) => (
              <motion.div
                key={batch.batch_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/batches/${batch.batch_id}`}
                  className="group block rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(batch.status)}
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {batch.spreadsheet_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(batch.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Export Results</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {batch.processed}/{batch.total_leads}
                      </span>
                    </div>
                    <Progress
                      value={(batch.processed / batch.total_leads) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-muted-foreground">
                          {batch.succeeded} sent
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-muted-foreground">
                          {batch.failed} failed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <StatusBadge status={batch.status} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
