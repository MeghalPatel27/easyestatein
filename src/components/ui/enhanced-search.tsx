import * as React from "react";
import { Search, Calendar, FileText, Users, Building, MapPin, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecentSearch {
  id: string;
  text: string;
  icon: React.ElementType;
  timestamp: Date;
}

interface EnhancedSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  showRecentSearches?: boolean;
  recentSearches?: RecentSearch[];
  onRecentSearchClick?: (search: RecentSearch) => void;
  className?: string;
  searchKey?: string; // unique key to store recent searches per component
}

const defaultRecentSearches: RecentSearch[] = [
  { id: "1", text: "Property in Mumbai", icon: Building, timestamp: new Date() },
  { id: "2", text: "2 BHK Apartment", icon: Users, timestamp: new Date() },
  { id: "3", text: "Commercial spaces", icon: FileText, timestamp: new Date() },
];

const getStorageKey = (searchKey: string) => `enhanced-search-${searchKey}`;

export function EnhancedSearch({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  showRecentSearches = true,
  recentSearches,
  onRecentSearchClick,
  className,
  searchKey = "default"
}: EnhancedSearchProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [storedSearches, setStoredSearches] = React.useState<RecentSearch[]>([]);
  
  React.useEffect(() => {
    if (searchKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(getStorageKey(searchKey));
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setStoredSearches(parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
            icon: getIconByName(item.iconName) || Search
          })));
        } catch (e) {
          console.error('Error parsing stored searches:', e);
        }
      } else {
        setStoredSearches(defaultRecentSearches);
      }
    }
  }, [searchKey]);

  const getIconByName = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      Calendar, FileText, Users, Building, MapPin, History, Search
    };
    return icons[iconName];
  };

  const addToRecentSearches = (query: string) => {
    if (!query.trim() || !searchKey) return;
    
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      text: query,
      icon: Search,
      timestamp: new Date()
    };

    const updated = [newSearch, ...storedSearches.filter(s => s.text !== query)].slice(0, 5);
    setStoredSearches(updated);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(searchKey), JSON.stringify(
        updated.map(item => ({
          id: item.id,
          text: item.text,
          iconName: 'Search',
          timestamp: item.timestamp
        }))
      ));
    }
  };

  const handleSearch = () => {
    addToRecentSearches(value);
    onSearch?.(value);
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRecentClick = (search: RecentSearch) => {
    onChange(search.text);
    onRecentSearchClick?.(search);
    setIsOpen(false);
  };

  const displayedSearches = recentSearches || storedSearches;

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsOpen(true)}
            className="pl-10 bg-white border-border focus:border-easyestate-pink"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-easyestate-pink hover:bg-easyestate-pink-dark text-white font-medium px-6"
        >
          SEARCH
        </Button>
      </div>

      {showRecentSearches && isOpen && displayedSearches.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 right-0 z-20 mt-2 p-4 bg-white border shadow-lg">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recent Search
              </div>
              <div className="space-y-2">
                {displayedSearches.map((search) => {
                  const IconComponent = search.icon;
                  return (
                    <button
                      key={search.id}
                      onClick={() => handleRecentClick(search)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-easyestate-pink-light rounded-md transition-colors text-left group"
                    >
                      <div className="w-8 h-8 bg-easyestate-pink-light rounded-full flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-easyestate-pink" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-easyestate-pink">
                        {search.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}