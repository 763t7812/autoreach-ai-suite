import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileUp,
  File,
  X,
  Building2,
  User,
  Globe,
  ArrowRight,
  Loader2,
  CheckCircle2,
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
import { cn } from "@/lib/utils";

export default function CsvUpload() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    services: "",
    websiteUrl: "",
    senderName: "",
    senderCompany: "",
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") ||
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls"))
    ) {
      setFile(droppedFile);
    } else {
      toast.error("Please upload a CSV or Excel file");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("user_services", formData.services);
      if (formData.websiteUrl) {
        formDataToSend.append("user_website_url", formData.websiteUrl);
      }
      formDataToSend.append("sender_name", formData.senderName);
      formDataToSend.append("sender_company", formData.senderCompany);

      const result = await api.uploadFile<{ batch_id: string; total_leads: number }>(
        "/batch/import-csv-excel",
        formDataToSend
      );

      toast.success(`Batch created with ${result.total_leads} leads!`);
      navigate(`/batches/${result.batch_id}`);
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
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
          <h1 className="text-2xl font-bold">Upload CSV/Excel</h1>
          <p className="text-muted-foreground">
            Upload a CSV or Excel file with your leads
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upload Details</CardTitle>
              <CardDescription>
                Upload your file and enter campaign information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div
                    className={cn(
                      "relative rounded-xl border-2 border-dashed p-8 transition-colors",
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      file && "border-success bg-success/5"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      {file ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 className="h-7 w-7 text-success" />
                          </div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </motion.div>
                      ) : (
                        <>
                          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
                            <FileUp className="h-7 w-7 text-primary" />
                          </div>
                          <p className="font-medium">
                            Drag and drop your file here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Supports CSV, XLSX, XLS (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expected Format Info */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2">Expected Columns:</p>
                  <div className="flex flex-wrap gap-2">
                    {["First Name", "Company Name", "Website URL", "Email"].map(
                      (col) => (
                        <span
                          key={col}
                          className="rounded-full bg-background px-3 py-1 text-xs font-medium"
                        >
                          {col}
                        </span>
                      )
                    )}
                  </div>
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
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Your Website URL (Optional)</Label>
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
                  disabled={isLoading || !file}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload & Process
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
