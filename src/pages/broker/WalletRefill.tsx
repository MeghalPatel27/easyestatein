import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, 
  Coins, 
  CreditCard, 
  Smartphone,
  Building2,
  Zap,
  Gift,
  Tag
} from "lucide-react";
import { Link } from "react-router-dom";

const WalletRefill = () => {
  const [selectedPlan, setSelectedPlan] = useState("plan2");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");

  const coinPlans = [
    {
      id: "plan1",
      coins: 100,
      price: 999,
      originalPrice: 1199,
      discount: "17% OFF",
      popular: false,
      description: "Perfect for occasional use"
    },
    {
      id: "plan2",
      coins: 250,
      price: 2249,
      originalPrice: 2999,
      discount: "25% OFF",
      popular: true,
      description: "Most popular choice"
    },
    {
      id: "plan3",
      coins: 500,
      price: 3999,
      originalPrice: 5999,
      discount: "33% OFF",
      popular: false,
      description: "Best value for heavy users"
    },
    {
      id: "plan4",
      coins: 1000,
      price: 6999,
      originalPrice: 11999,
      discount: "42% OFF",
      popular: false,
      description: "Enterprise level"
    }
  ];

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, MasterCard, RuPay"
    },
    {
      id: "upi",
      name: "UPI",
      icon: Smartphone,
      description: "GPay, PhonePe, Paytm"
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Building2,
      description: "All major banks"
    }
  ];

  const selectedPlanData = coinPlans.find(plan => plan.id === selectedPlan);

  const handlePayment = () => {
    // Handle payment logic here
    console.log("Processing payment for:", selectedPlanData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/broker/wallet">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buy Coins</h1>
          <p className="text-muted-foreground">Refill your wallet to unlock premium leads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Coin Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Balance */}
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-orange-600">250 coins</p>
              </div>
            </div>
          </Card>

          {/* Coin Plans */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Choose Your Coin Package</h2>
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-4">
              {coinPlans.map((plan) => (
                <div key={plan.id} className="relative">
                  <label
                    htmlFor={plan.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={plan.id} id={plan.id} className="mr-4" />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-orange-500" />
                            <span className="text-2xl font-bold">{plan.coins}</span>
                            <span className="text-muted-foreground">coins</span>
                          </div>
                          {plan.popular && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Zap className="h-3 w-3 mr-1" />
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">₹{plan.price}</span>
                            <span className="text-sm text-muted-foreground line-through">₹{plan.originalPrice}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {plan.discount}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{(plan.price / plan.coins).toFixed(2)} per coin
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </RadioGroup>

            {/* Custom Amount */}
            <div className="mt-6 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <Label htmlFor="custom-amount" className="text-sm font-medium">
                Or enter custom amount
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter amount in ₹"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <Button variant="outline">Calculate Coins</Button>
              </div>
            </div>
          </Card>

          {/* Promo Code */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Have a Promo Code?</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button variant="outline" className="gap-2">
                <Tag className="h-4 w-4" />
                Apply
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Payment & Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            {selectedPlanData && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Coins</span>
                  <span className="font-medium">{selectedPlanData.coins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="line-through text-muted-foreground">₹{selectedPlanData.originalPrice}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount ({selectedPlanData.discount})</span>
                  <span>-₹{selectedPlanData.originalPrice - selectedPlanData.price}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{selectedPlanData.price}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    htmlFor={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method.id 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="mr-3" />
                    <Icon className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </Card>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment} 
            className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Pay ₹{selectedPlanData?.price || 0} Securely
          </Button>

          {/* Security Note */}
          <div className="text-center text-sm text-muted-foreground">
            <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletRefill;