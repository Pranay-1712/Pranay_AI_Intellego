import React from "react";

interface LoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export function Loading({ 
  message = "Casting spell...", 
  size = "medium" 
}: LoadingProps) {
  const sizeClasses = {
    small: "w-24 h-24",
    medium: "w-32 h-32",
    large: "w-40 h-40"
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer rotating cauldron */}
        <div className="absolute inset-0 rounded-full border-4 border-t-[#a64aff] border-r-[#fc6c8f] border-b-[#a64aff] border-l-[#fc6c8f] animate-spin"></div>
        
        {/* Inner magical glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[rgba(166,74,255,0.2)] to-[rgba(252,108,143,0.2)] backdrop-blur-sm"></div>
        
        {/* Cauldron contents - bubbling potion */}
        <div className="absolute inset-8 rounded-full overflow-hidden flex items-end">
          <div className="w-full h-3/4 bg-gradient-to-t from-[#a64aff] to-[#fc6c8f] animate-pulse">
            {/* Bubbles */}
            <div className="bubble-small" style={{ left: '20%', animationDelay: '0s' }}></div>
            <div className="bubble-medium" style={{ left: '50%', animationDelay: '0.5s' }}></div>
            <div className="bubble-small" style={{ left: '80%', animationDelay: '1s' }}></div>
            <div className="bubble-medium" style={{ left: '30%', animationDelay: '1.5s' }}></div>
            <div className="bubble-small" style={{ left: '70%', animationDelay: '2s' }}></div>
          </div>
        </div>
        
        {/* Steam effect */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="steam-particle delay-0"></div>
          <div className="steam-particle delay-1"></div>
          <div className="steam-particle delay-2"></div>
        </div>
      </div>
      
      {message && (
        <p className="mt-4 text-lg font-medium bg-gradient-to-r from-[#a64aff] to-[#fc6c8f] bg-clip-text text-transparent">
          {message}
        </p>
      )}
    </div>
  );
} 