// src/lib/errors.ts
import { toast } from 'sonner';

export type ErrorWithMessage = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

/**
 * Parse error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle Supabase or custom errors with message property
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    const typedError = error as ErrorWithMessage;
    
    // If error has a code, include it in the message for easier debugging
    if (typedError.code) {
      return `${typedError.message} (${typedError.code})`;
    }
    
    return typedError.message;
  }
  
  // Fallback for other error types
  return 'An unknown error occurred';
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, fallbackMessage: string = 'An error occurred'): string {
  const errorMessage = getErrorMessage(error);
  console.error(errorMessage, error);
  
  // Log error to monitoring service in production
  if (import.meta.env.PROD) {
    // TODO: Implement proper error logging
  }
  
  return errorMessage || fallbackMessage;
}

/**
 * Handle auth specific errors
 */
export function handleAuthError(error: unknown): string {
  const errorMessage = getErrorMessage(error);
  
  // Special handling for common auth errors
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (errorMessage.includes('Email already exists')) {
    return 'This email is already registered. Please log in instead.';
  }
  
  if (errorMessage.includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }
  
  if (errorMessage.includes('network')) {
    return 'Network error. Please check your connection.';
  }
  
  // Generic auth error
  return errorMessage || 'Authentication failed. Please try again.';
}

/**
 * Show toast for error
 */
export function showErrorToast(error: unknown, fallbackMessage: string = 'An error occurred'): void {
  const message = getErrorMessage(error) || fallbackMessage;
  toast.error(message);
}

/**
 * Show toast for success
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Get form validation error message
 */
export function getValidationErrorMessage(error: unknown): string {
  if (!error) return '';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return '';
}