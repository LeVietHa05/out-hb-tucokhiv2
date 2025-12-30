'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import SimpleExportButtonTW from './ExportButton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header() {
  const { data: commandData } = useSWR('/api/command', fetcher, { refreshInterval: 1000 });
  const { data: userData } = useSWR('/api/user', fetcher, { refreshInterval: 5000 });
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnrollClick = async () => {
    setIsEnrolling(true);
    try {
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'enroll' }),
      });
      // Note: Enrollment mode will be handled in UserPanel
    } catch (error) {
      console.error('Error sending enroll command:', error);
      setIsEnrolling(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/user', { method: 'DELETE' });
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Reset enrolling state when command is cleared
  useEffect(() => {
    if (commandData?.command !== 'enroll_fingerprint') {
      setIsEnrolling(false);
    }
  }, [commandData]);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Smart Tool Cabinet Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {userData && (
              <span className="text-sm text-gray-600">
                Welcome, {userData.name} ({userData.role})
              </span>
            )}
            <button
              onClick={handleEnrollClick}
              disabled={isEnrolling}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isEnrolling ? 'Enrolling...' : 'New Enroll'}
            </button>
            {userData && (
              <>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
                <SimpleExportButtonTW />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
