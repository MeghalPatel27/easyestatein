import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PropertyManager from "./pages/PropertyManager";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// New Pages for Complete Flow
import PostRequirement from "./pages/PostRequirement";
import ChatsListing from "./pages/ChatsListing";
import ChatBox from "./pages/ChatBox";
import RequirementDetails from "./pages/RequirementDetails";

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
import ChatManager from "./pages/broker/ChatManager";

// Buyer Pages
import BuyerLayout from "./pages/buyer/BuyerLayout";
import BuyerDashboard from "./pages/buyer/Dashboard";
import Requirements from "./pages/buyer/Requirements";
import BuyerChats from "./pages/buyer/BuyerChats";
import PropertySearch from "./pages/buyer/PropertySearch";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Buyer Flow Routes */}
          <Route path="/post-requirement" element={<PostRequirement />} />
          <Route path="/chats" element={<ChatsListing />} />
          <Route path="/chat/:chatId" element={<ChatBox />} />
          <Route path="/requirement/:requirementId" element={<RequirementDetails />} />
          
          {/* Buyer Dashboard Routes */}
          <Route path="/buyer" element={<BuyerLayout />}>
            <Route path="dashboard" element={<BuyerDashboard />} />
            <Route path="requirements" element={<Requirements />} />
            <Route path="chats" element={<BuyerChats />} />
            <Route path="search" element={<PropertySearch />} />
          </Route>
          
          {/* Seller/Broker Flow Routes */}
          <Route path="/property-manager" element={<PropertyManager />} />
          
          {/* New Broker System Routes */}
          <Route path="/broker" element={<BrokerLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<LeadsListing />} />
            <Route path="leads/:leadId" element={<LeadDetails />} />
            <Route path="properties" element={<PropertiesList />} />
            <Route path="properties/new" element={<PropertiesNew />} />
            <Route path="lead-manager" element={<LeadManager />} />
            <Route path="chat-manager" element={<ChatManager />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="wallet/refill" element={<WalletRefill />} />
            
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
