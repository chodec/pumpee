// src/components/organisms/DashboardLayout.tsx
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
        { name: 'Workouts', path: DASHBOARD_ROUTES.TRAINER.WORKOUTS, icon: 'dumbbell' },
        { name: 'Schedule', path: DASHBOARD_ROUTES.TRAINER.SCHEDULE, icon: 'calendar' },
        { name: 'Subscriptions', path: DASHBOARD_ROUTES.TRAINER.SUBSCRIPTIONS, icon: 'credit-card' },
      ];
    }
  }, [userType]);

  return (
    <div className="flex h-screen bg-gray-50">
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
          fixed inset-y-0 left-0 z-30 w-64 transform bg-[#007bff] text-white transition duration-300 ease-in-out lg:static lg:translate-x-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-center border-b border-blue-500">
          <h1 className="text-2xl font-bold">Pumpee</h1>
        </div>

        <nav className="mt-6 px-4" aria-label="Dashboard Navigation">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors
                    ${isActivePath(item.path) 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'}
                  `}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-current={isActivePath(item.path) ? 'page' : undefined}
                >
                  <span className="mr-3">
                    <Icon name={item.icon as any} />
                  </span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-blue-500 p-4">
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            variant="ghost"
            isLoading={isSigningOut}
            className="flex w-full items-center rounded-md px-4 py-3 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white disabled:opacity-50"
          >
            <span className="mr-3">
              <Icon name="log-out" />
            </span>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-md p-2 text-gray-500 focus:outline-none focus:ring lg:hidden"
              aria-label="Open sidebar menu"
              aria-expanded={isMobileSidebarOpen}
              aria-controls="sidebar-menu"
            >
              <Icon name="menu" />
            </button>
            <div className="flex items-center">
              <span className="font-medium capitalize">{userType} Dashboard</span>
            </div>
            <div className="flex items-center">
              <button
                className="flex items-center rounded-full bg-gray-200 p-1 text-sm focus:outline-none focus:ring"
                aria-label="User menu"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-[#007bff] text-white flex items-center justify-center">
                  <Icon name="user" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}