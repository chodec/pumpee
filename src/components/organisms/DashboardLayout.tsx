// src/components/organisms/DashboardLayout.tsx - Updated with Subscription Plans navigation
import React, { ReactNode, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Icon from '@/components/atoms/Icon';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { USER_TYPES, DASHBOARD_ROUTES } from '@/lib/constants';
import { UserType } from '@/lib/types';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: UserType;
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Memoize navigation items based on user type
  const navigationItems = useMemo(() => {
    if (userType === USER_TYPES.CLIENT) {
      return [
        { name: 'Dashboard', path: DASHBOARD_ROUTES.CLIENT.DASHBOARD, icon: 'home' },
        { name: 'My Profile', path: DASHBOARD_ROUTES.CLIENT.PROFILE, icon: 'user' },
        { name: 'My Trainers', path: DASHBOARD_ROUTES.CLIENT.TRAINERS, icon: 'users' },
        { name: 'Workouts', path: DASHBOARD_ROUTES.CLIENT.WORKOUTS, icon: 'dumbbell' },
        { name: 'Progress', path: DASHBOARD_ROUTES.CLIENT.PROGRESS, icon: 'chart-line' },
      ];
    } else {
      return [
        { name: 'Dashboard', path: DASHBOARD_ROUTES.TRAINER.DASHBOARD, icon: 'home' },
        { name: 'My Profile', path: DASHBOARD_ROUTES.TRAINER.PROFILE, icon: 'user' },
        { name: 'My Clients', path: DASHBOARD_ROUTES.TRAINER.CLIENTS, icon: 'users' },
        { name: 'Workouts', path: '/trainer/workouts', icon: 'dumbbell' },
        { name: 'Menus', path: '/trainer/menus', icon: 'calendar' },
        { name: 'My Plans', path: '/trainer/subscription-plans', icon: 'credit-card' },
        { name: 'Subscriptions', path: DASHBOARD_ROUTES.TRAINER.SUBSCRIPTIONS, icon: 'credit-card' },
      ];
    }
  }, [userType]);

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition duration-300 ease-in-out lg:static lg:translate-x-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo/Brand Section */}
        <div className="flex h-16 items-center justify-start px-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007bff] text-white mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#040b07]">Pumpee</h1>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Navigation */}
          <div className="px-3">
            <div className="mb-2">
              <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {userType === USER_TYPES.CLIENT ? 'CLIENT' : 'TRAINER'}
              </p>
            </div>
            <nav className="space-y-1" aria-label="Dashboard Navigation">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActivePath(item.path) 
                      ? 'bg-[#007bff] text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-current={isActivePath(item.path) ? 'page' : undefined}
                >
                  <span className={`mr-3 flex-shrink-0 ${isActivePath(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    <Icon name={item.icon as any} size={18} />
                  </span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Settings Section */}
          <div className="mt-8 px-3">
            <div className="mb-2">
              <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                SYSTEM
              </p>
            </div>
            <nav className="space-y-1">
              <button
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <span className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* User Profile & Logout Section - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="flex items-center mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 mr-3">
              <Icon name="user" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userType === USER_TYPES.CLIENT ? 'Client User' : 'Trainer User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userType} Account
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {isSigningOut ? (
              <LoadingSpinner size="sm" className="mr-3" />
            ) : (
              <span className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500">
                <Icon name="log-out" size={16} />
              </span>
            )}
            {isSigningOut ? 'Signing Out...' : 'Log out'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#007bff] lg:hidden"
              aria-label="Open sidebar menu"
              aria-expanded={isMobileSidebarOpen}
              aria-controls="sidebar-menu"
            >
              <Icon name="menu" size={20} />
            </button>
            
            <div className="flex items-center">
              <span className="text-lg font-semibold text-[#040b07] capitalize">
                {userType} Dashboard
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notification bell (placeholder) */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.485 3.515a5.985 5.985 0 018.485 8.485l-8.485-8.485z" />
                </svg>
              </button>
              
              {/* User avatar */}
              <button className="flex items-center rounded-full bg-gray-100 p-1 text-sm hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#007bff]">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-[#007bff] text-white flex items-center justify-center">
                  <Icon name="user" size={16} />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f8f9fa] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}