import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Coins, User, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const BrokerLayout = () => {
  const location = useLocation();
  const [coinBalance] = useState(250); // Mock coin balance

  const navigation = [
    { name: "Dashboard", href: "/broker/dashboard" },
    { name: "Leads", href: "/broker/leads" },
    { name: "Properties", href: "/broker/properties" },
    { name: "Lead Manager", href: "/broker/lead-manager" },
    { name: "Chat Manager", href: "/broker/chat-manager" },
    { name: "Wallet", href: "/broker/wallet" },
    { name: "Analytics", href: "/broker/analytics" },
  ];

  const NavItems = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname.startsWith(item.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          {item.name}
        </Link>
      ))}
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
              <h1 className="text-xl font-bold">easyestate</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavItems />
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Coin Balance */}
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Coins className="h-4 w-4" />
                <span>{coinBalance}</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary"></span>
              </Button>

              {/* Profile */}
              <Link to="/broker/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
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