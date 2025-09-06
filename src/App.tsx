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

// Broker Pages
import BrokerLayout from "./pages/broker/BrokerLayout";
import Dashboard from "./pages/broker/Dashboard";
import LeadsListing from "./pages/broker/LeadsListing";
import LeadDetails from "./pages/broker/LeadDetails";
import PropertiesNew from "./pages/broker/PropertiesNew";
import PropertiesList from "./pages/broker/PropertiesList";
import Wallet from "./pages/broker/Wallet";
import WalletRefill from "./pages/broker/WalletRefill";
import LeadManager from "./pages/broker/LeadManager";

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
          
          {/* New Broker System Routes */}
          <Route path="/broker" element={<BrokerLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<LeadsListing />} />
            <Route path="leads/:leadId" element={<LeadDetails />} />
            <Route path="properties" element={<PropertiesList />} />
            <Route path="properties/new" element={<PropertiesNew />} />
            <Route path="lead-manager" element={<LeadManager />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="wallet/refill" element={<WalletRefill />} />
            <Route path="profile" element={<BrokerProfile />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
