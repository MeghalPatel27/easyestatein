import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  Plus, 
  ArrowUp,
  ArrowDown,
  Hourglass,
  Calendar,
  Receipt,
  CreditCard,
  RefreshCw,
  Download,
  Filter,
  Wallet as WalletIcon
} from "lucide-react";
import { Link } from "react-router-dom";

const Wallet = () => {
  const [currentBalance] = useState(250);
  const [monthlySpent] = useState(180);
  const [averageLeadCost] = useState(65);

  // Mock transaction data
  const transactions = [
    {
      id: 1,
      type: "debit",
      amount: 50,
      description: "Lead unlock - Premium Buyer in BKC",
      leadId: "L001",
      date: "2024-01-20",
      time: "14:30",
      status: "completed"
    },
    {
      id: 2,
      type: "credit",
      amount: 100,
      description: "Refund - Rejected lead submission",
      leadId: "L002",
      date: "2024-01-19",
      time: "11:15",
      status: "completed"
    },
    {
      id: 3,
      type: "credit",
      amount: 500,
      description: "Coins purchase - Payment ID: PAY123456",
      paymentId: "PAY123456",
      date: "2024-01-18",
      time: "09:45",
      status: "completed"
    },
    {
      id: 4,
      type: "hold",
      amount: 75,
      description: "Lead unlock pending verification",
      leadId: "L003",
      date: "2024-01-17",
      time: "16:20",
      status: "pending"
    },
    {
      id: 5,
      type: "debit",
      amount: 40,
      description: "Lead unlock - Residential buyer in Andheri",
      leadId: "L004",
      date: "2024-01-16",
      time: "13:10",
      status: "completed"
    },
    {
      id: 6,
      type: "hold",
      amount: 120,
      description: "Payment processing - Awaiting confirmation",
      paymentId: "PAY123457",
      date: "2024-01-15",
      time: "10:30",
      status: "pending"
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case "credit": return ArrowDown; // Refunded credits - green down arrow
      case "debit": return ArrowUp;   // Paid outgoing - red up arrow  
      case "hold": return Hourglass;  // On hold - yellow hourglass
      default: return ArrowUp;
    }
  };

  const getTransactionColor = (type: string) => {
    switch(type) {
      case "credit": return "text-green-600"; // Refunded credits - green
      case "debit": return "text-red-600";    // Paid outgoing - red
      case "hold": return "text-yellow-600";  // On hold - yellow
      default: return "text-red-600";
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case "credit": return "bg-green-100"; // Refunded credits - green
      case "debit": return "bg-red-100";    // Paid outgoing - red
      case "hold": return "bg-yellow-100";  // On hold - yellow
      default: return "bg-red-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Wallet & Coins</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link to="/broker/wallet/refill">
            <Button className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Plus className="h-4 w-4" />
              Buy Coins
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-3xl font-bold text-orange-600">{currentBalance}</p>
            <p className="text-sm text-muted-foreground">coins</p>
          </div>
        </Card>

        {/* Monthly Spent */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">This Month Spent</p>
            <p className="text-3xl font-bold text-red-600">{monthlySpent}</p>
            <p className="text-sm text-muted-foreground">coins</p>
          </div>
        </Card>

        {/* Average Lead Cost */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <WalletIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Lead Cost</p>
            <p className="text-3xl font-bold text-blue-600">{averageLeadCost}</p>
            <p className="text-sm text-muted-foreground">coins per lead</p>
          </div>
        </Card>
      </div>


      {/* Transaction History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="debits">Debits</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(transaction.type)}`}>
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{transaction.date} at {transaction.time}</span>
                          {transaction.leadId && (
                            <>
                              <span>•</span>
                              <Link to={`/broker/leads/${transaction.leadId}`} className="text-primary hover:underline">
                                {transaction.leadId}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        {transaction.type === "credit" ? "+" : "-"}{transaction.amount} coins
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline">Load More Transactions</Button>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="mt-6">
            <div className="space-y-4">
              {transactions.filter(t => t.type === "credit").map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(transaction.type)}`}>
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{transaction.date} at {transaction.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        +{transaction.amount} coins
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="debits" className="mt-6">
            <div className="space-y-4">
              {transactions.filter(t => t.type === "debit").map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(transaction.type)}`}>
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{transaction.date} at {transaction.time}</span>
                          {transaction.leadId && (
                            <>
                              <span>•</span>
                              <Link to={`/broker/leads/${transaction.leadId}`} className="text-primary hover:underline">
                                {transaction.leadId}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        -{transaction.amount} coins
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Wallet;