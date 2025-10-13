import React from 'react';
import { cn } from '@/lib/utils';

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
    // Only allow single selection
    const newDirections = selectedDirections.includes(directionId)
      ? []
      : [directionId];
    
    onDirectionsChange(newDirections);
  };

  const getPositionStyles = (angle: number) => {
    const radius = 50; // Further reduced distance from center
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
    <div className={cn("relative w-full max-w-[160px] mx-auto", className)}>
      {/* Compass Circle */}
      <div className="relative aspect-square w-full">
        {/* Center Circle */}
        <div className="absolute inset-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted border border-border" />
        
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
                "w-7 h-7 rounded-full border transition-all duration-200",
                "hover:scale-110 hover:shadow-md active:scale-95",
                "focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1",
                isSelected
                  ? "bg-red-500 border-red-500 text-white shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:border-red-500 hover:text-red-600 hover:bg-red-50"
              )}
              title={direction.fullName}
            >
              <span className={cn(
                "text-xs font-semibold transition-all duration-200",
                isSelected ? "text-white" : "text-current"
              )}>
                {direction.id}
              </span>
              
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
          {/* Main axes - shorter lines */}
          <div className={cn(
            "absolute top-1/2 left-1/4 right-1/4 h-px transition-colors duration-200",
            selectedDirections.length > 0 ? "bg-red-500/40" : "bg-border/20"
          )} />
          <div className={cn(
            "absolute left-1/2 top-1/4 bottom-1/4 w-px transition-colors duration-200",
            selectedDirections.length > 0 ? "bg-red-500/40" : "bg-border/20"
          )} />
          {/* Diagonal axes - shorter */}
          <div className="absolute inset-1/4"
               style={{ 
                 background: selectedDirections.length > 0 
                   ? `linear-gradient(45deg, transparent 48%, rgba(239, 68, 68, 0.4) 50%, transparent 52%)`
                   : `linear-gradient(45deg, transparent 48%, hsl(var(--border) / 0.15) 50%, transparent 52%)` 
               }} />
          <div className="absolute inset-1/4"
               style={{ 
                 background: selectedDirections.length > 0
                   ? `linear-gradient(-45deg, transparent 48%, rgba(239, 68, 68, 0.4) 50%, transparent 52%)`
                   : `linear-gradient(-45deg, transparent 48%, hsl(var(--border) / 0.15) 50%, transparent 52%)` 
               }} />
        </div>
      </div>
      
      {/* Selected Direction */}
      {selectedDirections.length > 0 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-muted-foreground">
            1 direction selected
          </span>
          <div className="text-xs text-red-600 mt-1">
            {selectedDirections[0]}
          </div>
        </div>
      )}
    </div>
  );
};