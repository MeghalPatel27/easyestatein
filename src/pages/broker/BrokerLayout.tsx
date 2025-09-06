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
    { name: "Inventory", href: "/broker/inventory" },
    { name: "Lead Manager", href: "/broker/lead-manager" },
    { name: "Wallet", href: "/broker/wallet" },
    { name: "Analytics", href: "/broker/analytics" },
    { name: "Profile", href: "/broker/profile" },
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
              <h1 className="text-xl font-bold">PropertyHub Pro</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavItems />
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Coin Balance */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full">
                <Coins className="h-4 w-4" />
                <span className="font-semibold">{coinBalance}</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive">
                  3
                </Badge>
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