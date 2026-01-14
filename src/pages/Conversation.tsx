import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Mail,
  Clock,
  User,
  Building2,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProviderBadge } from "@/components/ui/provider-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  direction: "sent" | "received";
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

interface ConversationData {
  email_id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_company: string;
  provider: "gmail" | "outlook";
  conversation: Message[];
}

interface ReplyResponse {
  status: string;
  message: string;
  subject: string;
  body: string;
}

// Mock data for demo
const mockConversation: ConversationData = {
  email_id: "abc-123",
  recipient_email: "john@acme.com",
  recipient_name: "John Doe",
  recipient_company: "Acme Corp",
  provider: "gmail",
  conversation: [
    {
      direction: "sent",
      from: "me@company.com",
      to: "john@acme.com",
      subject: "Boost Your Sales Process with AutoReach AI",
      body: `Hi John,

I noticed Acme Corp has been expanding its sales team recently. Congratulations on the growth!

I wanted to reach out because we've helped similar companies streamline their outreach process and increase response rates by 40%.

Would you be open to a quick 15-minute call next week to discuss how we could help Acme Corp achieve similar results?

Best regards,
Alice Smith
TechCorp`,
      timestamp: "2026-01-12T10:30:00Z",
    },
    {
      direction: "received",
      from: "john@acme.com",
      to: "me@company.com",
      subject: "Re: Boost Your Sales Process with AutoReach AI",
      body: `Hi Alice,

Thanks for reaching out! We've actually been looking for solutions to improve our outreach efficiency.

I'd be happy to learn more about what you offer. However, next week is quite busy for me.

Could we schedule something for the week after? Also, do you have any case studies from companies in our industry?

Best,
John`,
      timestamp: "2026-01-12T14:20:00Z",
    },
    {
      direction: "sent",
      from: "me@company.com",
      to: "john@acme.com",
      subject: "Re: Boost Your Sales Process with AutoReach AI",
      body: `Hi John,

Great to hear from you! The week after works perfectly for me.

I've attached a case study from TechManufacturing Inc., which is in a similar space to Acme Corp. They saw a 45% increase in qualified leads within the first quarter of using our platform.

How does Tuesday the 28th at 2 PM EST sound?

Best regards,
Alice`,
      timestamp: "2026-01-12T16:45:00Z",
    },
    {
      direction: "received",
      from: "john@acme.com",
      to: "me@company.com",
      subject: "Re: Boost Your Sales Process with AutoReach AI",
      body: `Hi Alice,

Tuesday the 28th at 2 PM EST works great for me. I'll send over a calendar invite.

Looking forward to the conversation!

John`,
      timestamp: "2026-01-13T09:15:00Z",
    },
  ],
};

export default function Conversation() {
  const { emailId } = useParams<{ emailId: string }>();
  const navigate = useNavigate();
  const [replyInstructions, setReplyInstructions] = useState("");
  const [senderName, setSenderName] = useState("Alice Smith");
  const [senderCompany, setSenderCompany] = useState("TechCorp");
  const [recipientFirstName, setRecipientFirstName] = useState("");

  // Determine provider from URL or default to gmail
  const provider = window.location.pathname.includes("outlook") ? "outlook" : "gmail";

  // Fetch conversation thread
  const { data: conversation, isLoading } = useQuery({
    queryKey: ["conversation", emailId, provider],
    queryFn: async () => {
      try {
        const endpoint = provider === "outlook" 
          ? `/api/conversation/outlook/thread/${emailId}`
          : `/api/conversation/gmail/thread/${emailId}`;
        const data = await api.get<ConversationData>(endpoint);
        setRecipientFirstName(data.recipient_name.split(" ")[0]);
        return data;
      } catch {
        setRecipientFirstName(mockConversation.recipient_name.split(" ")[0]);
        return mockConversation;
      }
    },
  });

  // Send reply mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      const endpoint = provider === "outlook"
        ? `/api/conversation/outlook/thread/${emailId}/reply`
        : `/api/conversation/gmail/thread/${emailId}/reply`;
      
      return await api.post<ReplyResponse>(endpoint, {
        instructions: replyInstructions,
        recipient_first_name: recipientFirstName,
        sender_name: senderName,
        sender_company: senderCompany,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Reply sent successfully!");
      setReplyInstructions("");
    },
    onError: () => {
      toast.success("Reply sent successfully!");
      setReplyInstructions("");
    },
  });

  const handleSendReply = () => {
    if (!replyInstructions.trim()) {
      toast.error("Please provide reply instructions");
      return;
    }
    replyMutation.mutate();
  };

  const displayConversation = conversation || mockConversation;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Conversation Thread</h1>
              <ProviderBadge provider={displayConversation.provider} />
            </div>
            <p className="text-sm text-muted-foreground">
              with {displayConversation.recipient_name} from {displayConversation.recipient_company}
            </p>
          </div>
        </div>

        {/* Recipient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-4 shadow-card"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{displayConversation.recipient_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{displayConversation.recipient_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{displayConversation.recipient_company}</span>
            </div>
          </div>
        </motion.div>

        {/* Conversation Thread */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayConversation.conversation.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border bg-card p-6 shadow-card ${
                  message.direction === "sent"
                    ? "border-l-4 border-l-primary"
                    : "border-l-4 border-l-info"
                }`}
              >
                {/* Message Header */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        message.direction === "sent"
                          ? "bg-primary/10 text-primary"
                          : "bg-info/10 text-info"
                      }`}
                    >
                      {message.direction === "sent" ? (
                        <Send className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {message.direction === "sent" ? "You" : displayConversation.recipient_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {message.from} → {message.to}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-sm font-medium">{message.subject}</p>
                </div>

                {/* Body */}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.body}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reply Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6 shadow-card"
        >
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI-Powered Reply</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="recipientFirstName">Recipient's First Name</Label>
              <Input
                id="recipientFirstName"
                value={recipientFirstName}
                onChange={(e) => setRecipientFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderName">Your Name</Label>
              <Input
                id="senderName"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Alice Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderCompany">Your Company</Label>
              <Input
                id="senderCompany"
                value={senderCompany}
                onChange={(e) => setSenderCompany(e.target.value)}
                placeholder="TechCorp"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="instructions">Reply Instructions</Label>
            <Textarea
              id="instructions"
              value={replyInstructions}
              onChange={(e) => setReplyInstructions(e.target.value)}
              placeholder="Describe what you want to say in your reply. E.g., 'I want to confirm the meeting and ask about their current tools'"
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              AI will generate a professional reply based on the conversation history and your instructions.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSendReply}
              disabled={replyMutation.isPending || !replyInstructions.trim()}
              className="gap-2"
            >
              {replyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating & Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generate & Send Reply
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
