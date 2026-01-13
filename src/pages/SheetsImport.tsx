import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Link2,
  Building2,
  User,
  Globe,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function SheetsImport() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    spreadsheetUrl: "",
    sheetName: "Sheet1",
    services: "",
    websiteUrl: "",
    senderName: "",
    senderCompany: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Extract spreadsheet ID from URL
      const match = formData.spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const spreadsheetId = match ? match[1] : formData.spreadsheetUrl;

      const result = await api.post<{ batch_id: string; total_leads: number }>("/batch/import-spreadsheet", {
        spreadsheet_id: spreadsheetId,
        sheet_name: formData.sheetName,
        user_services: formData.services,
        user_website_url: formData.websiteUrl || undefined,
        sender_name: formData.senderName,
        sender_company: formData.senderCompany,
      });

      toast.success(`Batch created with ${result.total_leads} leads!`);
      navigate(`/batches/${result.batch_id}`);
    } catch (error) {
      toast.error("Failed to import spreadsheet. Please try again.");
      // Demo: Navigate anyway
      toast.success("Demo: Navigating to batch...");
      navigate("/batches/batch-demo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Import from Google Sheets</h1>
          <p className="text-muted-foreground">
            Import leads from a Google Sheets spreadsheet
          </p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-info/20 bg-info/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-info">
                <FileSpreadsheet className="h-5 w-5" />
                Expected Spreadsheet Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Your spreadsheet should have these columns (case-insensitive):
              </p>
              <div className="flex flex-wrap gap-2">
                {["First Name", "Company Name", "Website URL", "Email"].map(
                  (col) => (
                    <span
                      key={col}
                      className="rounded-full bg-info/10 px-3 py-1 text-xs font-medium text-info"
                    >
                      {col}
                    </span>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Import Details</CardTitle>
              <CardDescription>
                Enter your spreadsheet details and campaign information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Spreadsheet URL */}
                <div className="space-y-2">
                  <Label htmlFor="spreadsheetUrl">
                    Google Sheets URL or Spreadsheet ID
                  </Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="spreadsheetUrl"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="pl-9"
                      value={formData.spreadsheetUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, spreadsheetUrl: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Sheet Name */}
                <div className="space-y-2">
                  <Label htmlFor="sheetName">Sheet Name</Label>
                  <Input
                    id="sheetName"
                    placeholder="Sheet1"
                    value={formData.sheetName}
                    onChange={(e) =>
                      setFormData({ ...formData, sheetName: e.target.value })
                    }
                  />
                </div>

                {/* Services Description */}
                <div className="space-y-2">
                  <Label htmlFor="services">Your Services Description</Label>
                  <Textarea
                    id="services"
                    placeholder="Describe what your company offers and how it helps customers..."
                    rows={4}
                    value={formData.services}
                    onChange={(e) =>
                      setFormData({ ...formData, services: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps AI generate personalized emails for each prospect
                  </p>
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">
                    Your Website URL (Optional)
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="websiteUrl"
                      type="url"
                      placeholder="https://yourcompany.com"
                      className="pl-9"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, websiteUrl: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI will analyze your website to better understand your offerings
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sender Name */}
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name</Label>
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

                  {/* Sender Company */}
                  <div className="space-y-2">
                    <Label htmlFor="senderCompany">Sender Company</Label>
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Import & Process
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
