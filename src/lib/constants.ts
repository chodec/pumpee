// src/lib/constants.ts
// App Information
export const APP_NAME = 'Pumpee';
export const APP_DESCRIPTION = 'Track your fitness journey and achieve your goals with Pumpee';

// Auth Routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
  USER_TYPE_SELECTION: '/user-type-selection',
  PASSWORD_RESET: '/password-reset'
};

// Dashboard Routes
export const DASHBOARD_ROUTES = {
  CLIENT: {
    DASHBOARD: '/client/dashboard',
    PROFILE: '/client/profile',
    TRAINERS: '/client/trainers',
    WORKOUTS: '/client/workouts',
    PROGRESS: '/client/progress'
  },
  TRAINER: {
    DASHBOARD: '/trainer/dashboard',
    PROFILE: '/trainer/profile',
    CLIENTS: '/trainer/clients',
    WORKOUTS: '/trainer/workouts',
    SCHEDULE: '/trainer/schedule',
    SUBSCRIPTIONS: '/trainer/subscriptions'
  }
};

// Colors from the design system
export const COLORS = {
  TEXT: '#040b07',
  BACKGROUND: '#f8f9fa',
  PRIMARY: '#007bff',
  SECONDARY: '#ff7f0e',
  ACCENT: '#7690cd',
  GRAY: '#444d59',
  
  // Subscription tier colors
  BASIC: '#444d59',
  ADVANCED: '#007bff',
  PRO: '#ff7f0e',
  ARNOLD: '#7690cd',
  
  // Status colors
  SUCCESS: '#34D399',
  WARNING: '#FBBF24',
  DANGER: '#EF4444',
  INFO: '#3B82F6'
};

// Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px'
};

// User types
export const USER_TYPES = {
  CLIENT: 'client' as const,
  TRAINER: 'trainer' as const
};

// Subscription tiers
export const SUBSCRIPTION_TIERS = [
  {
    id: 'tier_basic',
    name: 'Basic',
    price: 0,
    description: 'Perfect for new or part-time coaches starting small.',
    features: [
      'Up to 10 clients',
      'Basic reporting'
    ],
    buttonColor: COLORS.BASIC,
    buttonText: 'Select Plan'
  },
  {
    id: 'tier_advanced',
    name: 'Advanced',
    price: 300,
    salePrice: 250,
    description: 'Adds tools for better client tracking & engagement.',
    features: [
      'Up to 50 clients',
      'Basic reporting',
      'Advanced analytics'
    ],
    buttonColor: COLORS.ADVANCED,
    buttonText: 'Select Plan'
  },
  {
    id: 'tier_pro',
    name: 'Pro',
    price: 800,
    salePrice: 650,
    description: 'Designed for full-time coaches scaling their business.',
    features: [
      'Up to 150 clients',
      'Basic reporting',
      'Advanced analytics',
      'Custom branding'
    ],
    buttonColor: COLORS.PRO,
    buttonText: 'Select Plan',
    popular: true
  },
  {
    id: 'tier_arnold',
    name: 'Arnold',
    price: null,
    description: 'Built for elite coaches managing large client bases.',
    features: [
      'Unlimited clients',
      'Basic reporting',
      'Advanced analytics',
      'Custom branding',
      'Priority support'
    ],
    buttonColor: COLORS.ARNOLD,
    buttonText: 'Contact Sales'
  }
];

// Feature comparison for subscription tiers
export const FEATURE_COMPARISON = [
  { feature: 'Basic Analytics for Coaches', basic: true, advanced: true, pro: true, arnold: true },
  { feature: 'Measurement of Progress', basic: true, advanced: true, pro: true, arnold: true },
  { feature: 'Menu Planning', basic: true, advanced: true, pro: true, arnold: true },
  { feature: 'Training Plans', basic: true, advanced: true, pro: true, arnold: true },
  { feature: 'Table of Feelings', basic: false, advanced: true, pro: true, arnold: true },
  { feature: 'Notifications (Email)', basic: false, advanced: true, pro: true, arnold: true },
  { feature: 'In-App Messaging', basic: false, advanced: false, pro: true, arnold: true },
  { feature: 'Advanced Analytics for Coaches', basic: false, advanced: false, pro: true, arnold: true }
];