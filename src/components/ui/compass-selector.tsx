import React from 'react';
import { cn } from '@/lib/utils';
import { Navigation } from 'lucide-react';

interface Direction {
  id: string;
  label: string;
  fullName: string;
  angle: number;
}

const DIRECTIONS: Direction[] = [
  { id: 'N', label: 'N', fullName: 'North', angle: 0 },
  { id: 'NE', label: 'NE', fullName: 'North-East', angle: 45 },
  { id: 'E', label: 'E', fullName: 'East', angle: 90 },
  { id: 'SE', label: 'SE', fullName: 'South-East', angle: 135 },
  { id: 'S', label: 'S', fullName: 'South', angle: 180 },
  { id: 'SW', label: 'SW', fullName: 'South-West', angle: 225 },
  { id: 'W', label: 'W', fullName: 'West', angle: 270 },
  { id: 'NW', label: 'NW', fullName: 'North-West', angle: 315 },
];

interface CompassSelectorProps {
  selectedDirections: string[];
  onDirectionsChange: (directions: string[]) => void;
  className?: string;
}

export const CompassSelector: React.FC<CompassSelectorProps> = ({
  selectedDirections,
  onDirectionsChange,
  className
}) => {
  const toggleDirection = (directionId: string) => {
    const newDirections = selectedDirections.includes(directionId)
      ? selectedDirections.filter(id => id !== directionId)
      : [...selectedDirections, directionId];
    
    onDirectionsChange(newDirections);
  };

  const getPositionStyles = (angle: number) => {
    const radius = 80; // Distance from center
    const centerX = 50; // Center X percentage
    const centerY = 50; // Center Y percentage
    
    // Convert angle to radians and calculate position
    const radian = (angle - 90) * (Math.PI / 180); // -90 to start from top
    const x = centerX + radius * Math.cos(radian);
    const y = centerY + radius * Math.sin(radian);
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className={cn("relative w-full max-w-xs mx-auto", className)}>
      {/* Compass Circle */}
      <div className="relative aspect-square w-full">
        {/* Center Circle */}
        <div className="absolute inset-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted border-2 border-border" />
        
        {/* Direction Arrows */}
        {DIRECTIONS.map((direction) => {
          const isSelected = selectedDirections.includes(direction.id);
          
          return (
            <button
              key={direction.id}
              onClick={() => toggleDirection(direction.id)}
              style={getPositionStyles(direction.angle)}
              className={cn(
                "absolute group flex items-center justify-center",
                "w-12 h-12 rounded-full border-2 transition-all duration-200",
                "hover:scale-110 hover:shadow-lg active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground shadow-md"
                  : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
              )}
              title={direction.fullName}
            >
              <Navigation 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isSelected ? "text-primary-foreground" : "text-current"
                )}
                style={{ 
                  transform: `rotate(${direction.angle}deg)` 
                }}
              />
              
              {/* Direction Label */}
              <span className={cn(
                "absolute -bottom-6 left-1/2 -translate-x-1/2",
                "text-xs font-medium whitespace-nowrap",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "bg-popover border border-border rounded px-2 py-1 shadow-sm",
                "pointer-events-none z-10"
              )}>
                {direction.fullName}
              </span>
            </button>
          );
        })}
        
        {/* Compass Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main axes */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/30" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/30" />
          {/* Diagonal axes */}
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-transparent via-border/20 to-transparent" 
               style={{ 
                 background: `linear-gradient(45deg, transparent 49%, hsl(var(--border) / 0.2) 50%, transparent 51%)` 
               }} />
          <div className="absolute top-0 left-0 right-0 bottom-0"
               style={{ 
                 background: `linear-gradient(-45deg, transparent 49%, hsl(var(--border) / 0.2) 50%, transparent 51%)` 
               }} />
        </div>
      </div>
      
      {/* Selected Count */}
      {selectedDirections.length > 0 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-muted-foreground">
            {selectedDirections.length} direction{selectedDirections.length !== 1 ? 's' : ''} selected
          </span>
          <div className="text-xs text-primary mt-1">
            {selectedDirections.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};