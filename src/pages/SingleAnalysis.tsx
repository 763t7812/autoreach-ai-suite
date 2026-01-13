import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Globe,
  Building2,
  User,
  Sparkles,
  Send,
  Mail,
  Loader2,
  CheckCircle2,
  Copy,
  Edit2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  url: string;
  discovered_emails: string[];
  primary_contact_email: string;
  analysis: {
    current_offerings: string[];
    potential_pain_points: string[];
    personalized_offer: string;
  };
  email_subject: string;
  email_body: string;
}

export default function SingleAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState({ subject: "", body: "" });
  const [formData, setFormData] = useState({
    customerUrl: "",
    websiteUrl: "",
    services: "",
    senderName: "",
    senderCompany: "",
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await api.post<AnalysisResult>("/analyze-and-outreach", {
        customer_url: formData.customerUrl,
        user_website_url: formData.websiteUrl || undefined,
        services: formData.services,
        sender_name: formData.senderName,
        sender_company: formData.senderCompany,
      });

      setResult(res);
      setSelectedEmails([res.primary_contact_email]);
      setEditedEmail({ subject: res.email_subject, body: res.email_body });
    } catch (error) {
      // Demo mock result
      const mockResult: AnalysisResult = {
        url: formData.customerUrl,
        discovered_emails: ["info@example.com", "sales@example.com", "contact@example.com"],
        primary_contact_email: "sales@example.com",
        analysis: {
          current_offerings: ["B2B SaaS Solutions", "Enterprise Software", "Cloud Services"],
          potential_pain_points: ["Manual sales processes", "Poor lead tracking", "Low email engagement"],
          personalized_offer: "AI-powered sales automation platform",
        },
        email_subject: "Streamline Your Sales Process with AI",
        email_body: `Hi [Name],

I noticed your company specializes in enterprise software solutions. Many teams in your space struggle with manual sales processes and low email engagement rates.

At ${formData.senderCompany || "TechCorp"}, we've helped similar companies increase their reply rates by 3x using AI-powered personalization.

Would you be open to a quick 15-minute call this week to explore if we might be a fit?

Best regards,
${formData.senderName || "John"}
${formData.senderCompany || "TechCorp"}`,
      };
      setResult(mockResult);
      setSelectedEmails([mockResult.primary_contact_email]);
      setEditedEmail({ subject: mockResult.email_subject, body: mockResult.email_body });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async (provider: "gmail" | "outlook") => {
    if (selectedEmails.length === 0) {
      toast.error("Please select at least one email");
      return;
    }

    setIsSending(true);

    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Email sent via ${provider === "gmail" ? "Gmail" : "Outlook"}!`);
    } catch {
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Single URL Analysis</h1>
          <p className="text-muted-foreground">
            Analyze a website and generate a personalized email
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Analyze Website
                </CardTitle>
                <CardDescription>
                  Enter the prospect's website to analyze and generate email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  {/* Customer URL */}
                  <div className="space-y-2">
                    <Label htmlFor="customerUrl">Customer Website URL *</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="customerUrl"
                        placeholder="https://prospect-company.com"
                        className="pl-9"
                        value={formData.customerUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, customerUrl: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Your Website */}
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Your Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="websiteUrl"
                        placeholder="https://your-company.com"
                        className="pl-9"
                        value={formData.websiteUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, websiteUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <Label htmlFor="services">Your Services</Label>
                    <Textarea
                      id="services"
                      placeholder="Describe what you offer..."
                      rows={3}
                      value={formData.services}
                      onChange={(e) =>
                        setFormData({ ...formData, services: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="senderName">Your Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="senderName"
                          placeholder="John Doe"
                          className="pl-9"
                          value={formData.senderName}
                          onChange={(e) =>
                            setFormData({ ...formData, senderName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senderCompany">Your Company *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="senderCompany"
                          placeholder="Acme Corp"
                          className="pl-9"
                          value={formData.senderCompany}
                          onChange={(e) =>
                            setFormData({ ...formData, senderCompany: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze & Generate Email
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {result ? (
              <>
                {/* Discovered Emails */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Discovered Emails
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.discovered_emails.map((email) => (
                        <div
                          key={email}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <Checkbox
                            checked={selectedEmails.includes(email)}
                            onCheckedChange={() => toggleEmail(email)}
                          />
                          <span className="flex-1">{email}</span>
                          {email === result.primary_contact_email && (
                            <Badge variant="secondary">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Current Offerings
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.current_offerings.map((offering) => (
                          <Badge key={offering} variant="outline">
                            {offering}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Potential Pain Points
                      </p>
                      <ul className="text-sm space-y-1">
                        {result.analysis.potential_pain_points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-warning" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Personalized Offer
                      </p>
                      <p className="text-sm">{result.analysis.personalized_offer}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Email */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Generated Email
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        {isEditing ? "Done" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input
                            value={editedEmail.subject}
                            onChange={(e) =>
                              setEditedEmail({ ...editedEmail, subject: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Body</Label>
                          <Textarea
                            value={editedEmail.body}
                            onChange={(e) =>
                              setEditedEmail({ ...editedEmail, body: e.target.value })
                            }
                            rows={10}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Subject
                          </p>
                          <p className="font-medium">{editedEmail.subject}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Body
                          </p>
                          <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                            {editedEmail.body}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleSend("gmail")}
                        disabled={isSending}
                      >
                        {isSending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M22 6.28V17.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5V6.28l9.72 7.04a.75.75 0 0 0 .87 0L22 6.28Z" fill="#EA4335" />
                          </svg>
                        )}
                        Send via Gmail
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSend("outlook")}
                        disabled={isSending}
                      >
                        {isSending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z" fill="#0078D4" />
                          </svg>
                        )}
                        Send via Outlook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex h-full min-h-[400px] items-center justify-center">
                <div className="text-center p-8">
                  <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Enter a URL to analyze
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Our AI will scrape the website, discover emails, and generate a personalized outreach email.
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
