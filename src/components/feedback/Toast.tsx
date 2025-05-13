// src/components/feedback/Toast.tsx
import { Toaster as SonnerToaster } from 'sonner';
import React from 'react';

type ToastProps = {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  richColors?: boolean;
  closeButton?: boolean;
};

export const Toaster: React.FC<ToastProps> = ({
  position = 'top-right',
  richColors = true,
  closeButton = true,
}) => {
  return (
    <SonnerToaster 
      position={position} 
      richColors={richColors} 
      closeButton={closeButton}
      expand={false}
      theme="light"
    />
  );
};

// Re-export toast function from sonner for direct usage
export { toast } from 'sonner';