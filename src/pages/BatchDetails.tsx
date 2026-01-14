import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  Send,
  RefreshCw,
  Search,
  Filter,
  Edit3,
  Eye,
  Trash2,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  status: "pending" | "processing" | "ready" | "sent" | "failed";
  emailDraft?: string;
  painPoints?: string[];
  sentAt?: string;
  error?: string;
}

interface BatchDetails {
  id: string;
  name: string;
  status: "draft" | "processing" | "ready" | "sending" | "completed" | "paused";
  totalLeads: number;
  processedLeads: number;
  sentLeads: number;
  failedLeads: number;
  createdAt: string;
  leads: Lead[];
}

const mockBatchDetails: BatchDetails = {
  id: "1",
  name: "Q1 Outreach Campaign",
  status: "ready",
  totalLeads: 150,
  processedLeads: 150,
  sentLeads: 0,
  failedLeads: 0,
  createdAt: "2024-01-15T10:30:00Z",
  leads: [
    {
      id: "1",
      name: "John Smith",
      email: "john@techcorp.com",
      company: "TechCorp",
      website: "https://techcorp.com",
      status: "ready",
      emailDraft:
        "Hi John,\n\nI noticed TechCorp is expanding its digital presence. Our platform has helped similar companies increase their outreach efficiency by 40%.\n\nWould you be open to a quick 15-minute call this week?\n\nBest,\nAlex",
      painPoints: ["Lead generation", "Sales automation", "CRM integration"],
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@innovate.io",
      company: "Innovate.io",
      website: "https://innovate.io",
      status: "ready",
      emailDraft:
        "Hi Sarah,\n\nI came across Innovate.io and was impressed by your recent product launch. We specialize in helping companies like yours scale their outreach.\n\nWould love to share some insights. Free for a quick chat?\n\nBest,\nAlex",
      painPoints: ["Scaling outreach", "Email deliverability"],
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@growthlab.com",
      company: "GrowthLab",
      website: "https://growthlab.com",
      status: "sent",
      emailDraft: "Hi Mike,\n\nYour work at GrowthLab caught my attention...",
      sentAt: "2024-01-15T14:30:00Z",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@startupx.com",
      company: "StartupX",
      website: "https://startupx.com",
      status: "failed",
      error: "Email bounced - invalid address",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david@enterprise.co",
      company: "Enterprise Co",
      website: "https://enterprise.co",
      status: "processing",
    },
  ],
};

export default function BatchDetails() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editedDraft, setEditedDraft] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: batch, isLoading, refetch } = useQuery({
    queryKey: ["batch", batchId],
    queryFn: async () => {
      try {
        return await api.get<BatchDetails>(`/batch/${batchId}`);
      } catch {
        return mockBatchDetails;
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "processing" || data?.status === "sending"
        ? 5000
        : false;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (leadIds?: string[]) => {
      return api.post(`/batch/${batchId}/send`, { leadIds });
    },
    onSuccess: () => {
      toast.success("Emails sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["batch", batchId] });
    },
    onError: () => {
      toast.error("Failed to send emails");
    },
  });

  const updateDraftMutation = useMutation({
    mutationFn: async ({ leadId, draft }: { leadId: string; draft: string }) => {
      return api.patch(`/batch/${batchId}/leads/${leadId}`, { emailDraft: draft });
    },
    onSuccess: () => {
      toast.success("Draft updated successfully!");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["batch", batchId] });
    },
    onError: () => {
      toast.error("Failed to update draft");
    },
  });

  const handleEditDraft = (lead: Lead) => {
    setSelectedLead(lead);
    setEditedDraft(lead.emailDraft || "");
    setIsEditDialogOpen(true);
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewDialogOpen(true);
  };

  const handleSaveDraft = () => {
    if (selectedLead) {
      updateDraftMutation.mutate({
        leadId: selectedLead.id,
        draft: editedDraft,
      });
    }
  };

  const handleSendAll = () => {
    const readyLeads = batch?.leads.filter((l) => l.status === "ready") || [];
    if (readyLeads.length === 0) {
      toast.error("No leads ready to send");
      return;
    }
    sendMutation.mutate(readyLeads.map((l) => l.id));
  };

  const handleSendSingle = (leadId: string) => {
    sendMutation.mutate([leadId]);
  };

  const filteredLeads =
    batch?.leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const getStatusIcon = (status: Lead["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "ready":
        return <Mail className="h-4 w-4 text-emerald-500" />;
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const progress = batch
    ? (batch.processedLeads / batch.totalLeads) * 100
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/batches")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{batch?.name}</h1>
              <p className="text-muted-foreground">
                Created {new Date(batch?.createdAt || "").toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {batch?.status === "ready" && (
              <Button
                onClick={handleSendAll}
                disabled={sendMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send All Ready
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{batch?.totalLeads}</div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-emerald-500">
                  {batch?.leads.filter((l) => l.status === "ready").length}
                </div>
                <p className="text-sm text-muted-foreground">Ready to Send</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">
                  {batch?.sentLeads}
                </div>
                <p className="text-sm text-muted-foreground">Sent</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">
                  {batch?.failedLeads}
                </div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Processing Progress</span>
              <span className="text-sm text-muted-foreground">
                {batch?.processedLeads} / {batch?.totalLeads} leads
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={batch?.status || "draft"} />
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Leads</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {statusFilter === "all" ? "All Status" : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                      Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("ready")}>
                      Ready
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("sent")}>
                      Sent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                      Failed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(lead.status)}
                        <span className="capitalize text-sm">{lead.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewLead(lead)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {lead.status === "ready" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditDraft(lead)}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendSingle(lead.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLeads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No leads found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Lead Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Company</label>
                  <p className="font-medium">{selectedLead.company}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Website</label>
                  <a
                    href={selectedLead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedLead.website}
                  </a>
                </div>
              </div>

              {selectedLead.painPoints && selectedLead.painPoints.length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    Identified Pain Points
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedLead.painPoints.map((point, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.emailDraft && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    Email Draft
                  </label>
                  <div className="mt-1 p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedLead.emailDraft}
                  </div>
                </div>
              )}

              {selectedLead.error && (
                <div>
                  <label className="text-sm text-destructive">Error</label>
                  <p className="text-destructive">{selectedLead.error}</p>
                </div>
              )}

              {selectedLead.sentAt && (
                <div>
                  <label className="text-sm text-muted-foreground">Sent At</label>
                  <p className="font-medium">
                    {new Date(selectedLead.sentAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Draft Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Draft</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Editing draft for{" "}
                  <span className="font-medium text-foreground">
                    {selectedLead.name}
                  </span>{" "}
                  at {selectedLead.company}
                </p>
                <Textarea
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  className="min-h-[300px]"
                  placeholder="Write your email..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDraft}
              disabled={updateDraftMutation.isPending}
            >
              {updateDraftMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
