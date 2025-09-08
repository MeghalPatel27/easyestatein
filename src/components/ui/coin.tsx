import { Home, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "w-16 h-8 px-2",
    coin: "w-6 h-6",
    icon: "w-3 h-3",
    text: "text-xs"
  },
  md: {
    container: "w-20 h-10 px-3",
    coin: "w-8 h-8",
    icon: "w-4 h-4",
    text: "text-sm"
  },
  lg: {
    container: "w-24 h-12 px-4",
    coin: "w-10 h-10",
    icon: "w-5 h-5",
    text: "text-base"
  }
};

export const Coin = ({ value, size = "md", className }: CoinProps) => {
  const config = sizeConfig[size];
  
  return (
    <div className={cn(
      "flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full shadow-lg",
      config.container,
      className
    )}>
      <div className={cn(
        "bg-gradient-to-br from-pink-300 to-pink-600 rounded-full flex items-center justify-center shadow-inner relative",
        config.coin
      )}>
        {/* 3D effect ring */}
        <div className="absolute inset-0.5 bg-gradient-to-br from-pink-200 to-pink-500 rounded-full opacity-80" />
        <div className="relative bg-gradient-to-br from-pink-400 to-pink-600 rounded-full w-full h-full flex items-center justify-center">
          <div className="relative">
            <Home className={cn("text-white", config.icon)} strokeWidth={2.5} />
            <Check className={cn("text-white absolute -bottom-0.5 -right-0.5", config.icon)} strokeWidth={3} style={{ fontSize: '0.6em' }} />
          </div>
        </div>
      </div>
      <span className={cn("text-white font-semibold", config.text)}>{value}</span>
    </div>
  );
};