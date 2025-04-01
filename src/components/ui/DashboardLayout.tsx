import React, { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'client' | 'trainer';
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Navigation items based on user type
  const navigationItems = userType === 'client' 
    ? [
        { name: 'Dashboard', path: '/client/dashboard', icon: 'home' },
        { name: 'My Profile', path: '/client/profile', icon: 'user' },
        { name: 'My Trainers', path: '/client/trainers', icon: 'users' },
        { name: 'Workouts', path: '/client/workouts', icon: 'dumbbell' },
        { name: 'Progress', path: '/client/progress', icon: 'chart-line' },
      ]
    : [
        { name: 'Dashboard', path: '/trainer/dashboard', icon: 'home' },
        { name: 'My Profile', path: '/trainer/profile', icon: 'user' },
        { name: 'My Clients', path: '/trainer/clients', icon: 'users' },
        { name: 'Workouts', path: '/trainer/workouts', icon: 'dumbbell' },
        { name: 'Schedule', path: '/trainer/schedule', icon: 'calendar' },
      ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform bg-blue-600 text-white transition duration-300 ease-in-out lg:static lg:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-center border-b border-blue-500">
          <h1 className="text-2xl font-bold">Pumpee</h1>
        </div>

        <nav className="mt-6 px-4">
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
                >
                  <span className="mr-3">
                    <Icon name={item.icon} />
                  </span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-blue-500 p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center rounded-md px-4 py-3 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
          >
            <span className="mr-3">
              <Icon name="log-out" />
            </span>
            Sign Out
          </button>
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
            >
              <Icon name="menu" />
            </button>
            <div className="flex items-center">
              <span className="font-medium capitalize">{userType} Dashboard</span>
            </div>
            <div className="flex items-center">
              <button
                className="flex items-center rounded-full bg-gray-200 p-1 text-sm focus:outline-none focus:ring"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
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

// Simple icon component
interface IconProps {
  name: string;
}

function Icon({ name }: IconProps) {
  // This is a simplified icon implementation
  // In a real application, you would use an icon library like heroicons, react-icons, etc.
  const iconMap: Record<string, ReactNode> = {
    'home': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    'user': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    'users': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    'dumbbell': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6h-2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2"></path>
        <path d="M6 6l12 0"></path>
        <path d="M18 6h2c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2"></path>
        <path d="M6 12h12"></path>
      </svg>
    ),
    'chart-line': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
      </svg>
    ),
    'calendar': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    'menu': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    ),
    'log-out': (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    ),
  };

  return <>{iconMap[name] || null}</>;
}