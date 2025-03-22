import React, { useEffect } from 'react';

/**
 * This component redirects to the main Dashboard implementation,
 * or just renders it directly since we have two dashboard components.
 */
const DashboardRedirect: React.FC = () => {
  // In case React Router is not available, we just import the main dashboard directly
  const MainDashboard = React.lazy(() => import('../Dashboard'));
  
  return (
    <React.Suspense fallback={
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4 text-theme-accent">
            <svg
              className="animate-spin h-8 w-8 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-theme-text-secondary">Loading Dashboard...</p>
        </div>
      </div>
    }>
      <MainDashboard />
    </React.Suspense>
  );
};

export default DashboardRedirect;