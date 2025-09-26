import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Wallet = () => {
  const { user, profile } = useAuth();

  // Fetch wallet transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Calculate stats from transactions
  const currentBalance = profile?.coin_balance || 0;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });
  
  const monthlySpent = monthlyTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalLeadPurchases = transactions.filter(t => t.type === 'debit').length;
  const averageLeadCost = totalLeadPurchases > 0 
    ? Math.round(transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0) / totalLeadPurchases)
    : 0;

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case "credit": return ArrowDown; // Credits - green down arrow
      case "debit": return ArrowUp;    // Spent - red up arrow  
      case "refund": return ArrowDown; // Refund - green down arrow
      default: return ArrowUp;
    }
  };

  const getTransactionColor = (type: string) => {
    switch(type) {
      case "credit": return "text-green-600"; // Credits - green
      case "debit": return "text-red-600";    // Spent - red
      case "refund": return "text-green-600"; // Refund - green
      default: return "text-red-600";
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case "credit": return "bg-green-100"; // Credits - green
      case "debit": return "bg-red-100";    // Spent - red
      case "refund": return "bg-green-100"; // Refund - green
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
            {isLoading ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center p-8">
                <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your transaction history will appear here once you start using coins.
                </p>
                <Link to="/broker/wallet/refill">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Buy Your First Coins
                  </Button>
                </Link>
              </div>
            ) : (
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
                            <span>{new Date(transaction.created_at).toLocaleString()}</span>
                            {transaction.reference_id && (
                              <>
                                <span>•</span>
                                <span className="text-primary">
                                  ID: {transaction.reference_id.slice(0, 8)}...
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${colorClass}`}>
                          {transaction.type === "credit" || transaction.type === "refund" ? "+" : "-"}{transaction.amount} coins
                        </p>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="credits" className="mt-6">
            <div className="space-y-4">
              {transactions.filter(t => t.type === "credit" || t.type === "refund").map((transaction) => {
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
                          <span>{new Date(transaction.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        +{transaction.amount} coins
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Completed
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
                          <span>{new Date(transaction.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${colorClass}`}>
                        -{transaction.amount} coins
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Completed
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