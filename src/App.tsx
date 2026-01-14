import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import BatchesList from "./pages/BatchesList";
import SheetsImport from "./pages/SheetsImport";
import CsvUpload from "./pages/CsvUpload";
import SingleAnalysis from "./pages/SingleAnalysis";
import Conversation from "./pages/Conversation";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyze" element={<SingleAnalysis />} />
            <Route path="/batches" element={<BatchesList />} />
            <Route path="/batches/sheets" element={<SheetsImport />} />
            <Route path="/batches/upload" element={<CsvUpload />} />
            <Route path="/conversation/:emailId" element={<Conversation />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
