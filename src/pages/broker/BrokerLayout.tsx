import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Coins, 
  User, 
  Menu, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Building, 
  UserCheck, 
  MessageSquare, 
  Wallet, 
  TrendingUp 
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/easyestate-logo.png";

const BrokerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      // Don't show error for session missing errors - user is already signed out
      if (error?.name !== 'AuthSessionMissingError') {
        toast.error("Error signing out");
      } else {
        // Session was already missing, just navigate to home
        navigate("/");
      }
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/broker/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/broker/leads", icon: Users },
    { name: "Lead Status", href: "/broker/lead-status", icon: TrendingUp },
    { name: "Properties", href: "/broker/properties", icon: Building },
    { name: "Lead Manager", href: "/broker/lead-manager", icon: UserCheck },
    { name: "Chat Manager", href: "/broker/chat-manager", icon: MessageSquare },
    { name: "Wallet", href: "/broker/wallet", icon: Wallet },
  ];

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`relative inline-flex items-center justify-center gap-2 whitespace-nowrap bg-transparent px-0 py-3 text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              location.pathname.startsWith(item.href)
                ? "text-primary after:scale-x-100"
                : "text-muted-foreground hover:text-foreground hover:after:scale-x-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col gap-4 mt-8">
                    <NavItems />
                  </div>
                </SheetContent>
              </Sheet>
              <img src="/lovable-uploads/f5037665-4ef9-41e4-b367-ed6a7bc46f19.png" alt="easyestate" className="h-8 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 border-b-0">
              <NavItems />
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Coin Balance */}
              <Link to="/broker/wallet">
                <div className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors cursor-pointer text-sm font-medium">
                  <Coins className="h-4 w-4" />
                  <span>{profile?.coin_balance || 0}</span>
                </div>
              </Link>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary"></span>
              </Button>

              {/* Profile Info */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Broker'}
                </span>
              </div>

              {/* Sign Out */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default BrokerLayout;