// src/components/atoms/LoadingSpinner.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className 
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorMap = {
    primary: 'border-[#007bff]',
    white: 'border-white'
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-t-4 border-b-4 border-opacity-70", 
        sizeMap[size],
        colorMap[color],
        className
      )}
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;