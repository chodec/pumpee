import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CloudflareTurnstileProps {
  sitekey: string;
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark';
  className?: string;
}

export const CloudflareTurnstile: React.FC<CloudflareTurnstileProps> = ({
  sitekey,
  onVerify,
  theme = 'light',
  className
}) => {
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Turnstile script is already loaded
    const existingScript = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      script.onload = () => {
        renderTurnstile();
      };

      script.onerror = () => {
        console.error('Failed to load Turnstile script');
      };
    } else {
      renderTurnstile();
    }

    function renderTurnstile() {
      if (window.turnstile && turnstileRef.current) {
        try {
          window.turnstile.render(turnstileRef.current, {
            sitekey: sitekey,
            theme: theme,
            callback: (token: string) => {
              onVerify(token);
            },
            'error-callback': () => {
              console.error('Turnstile verification failed');
            }
          });
        } catch (error) {
          console.error('Turnstile rendering error:', error);
        }
      }
    }

    return () => {
      // Cleanup logic if needed
    };
  }, [sitekey, theme, onVerify]);

  return (
    <div 
      ref={turnstileRef} 
      className={cn("cloudflare-turnstile", className)}
    />
  );
};