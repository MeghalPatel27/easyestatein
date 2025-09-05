import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BrokerDashboard from "./pages/BrokerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import LeadManagement from "./pages/LeadManagement";
import SentLeads from "./pages/SentLeads";
import BrokerProfile from "./pages/BrokerProfile";
import PropertyManager from "./pages/PropertyManager";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/broker-dashboard" element={<BrokerDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/lead-management" element={<LeadManagement />} />
          <Route path="/sent-leads" element={<SentLeads />} />
          <Route path="/broker-profile" element={<BrokerProfile />} />
          <Route path="/property-manager" element={<PropertyManager />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
