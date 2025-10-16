'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserPanel() {
  const { data: userData, error: userError, mutate: mutateUser } = useSWR('/api/user', fetcher, { refreshInterval: 30000 });
  const { data: enrollData, error: enrollError } = useSWR('/api/enroll_result', fetcher, { refreshInterval: 5000 });
  const { data: commandData } = useSWR('/api/command', fetcher, { refreshInterval: 1000 });

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [isWaitingForFingerprint, setIsWaitingForFingerprint] = useState(false);

  useEffect(() => {
    if (commandData?.command === 'enroll_fingerprint') {
      setIsEnrolling(true);
      setIsWaitingForFingerprint(true);
    }
  }, [commandData]);

  const handleSaveUser = async () => {
    if (!newUserName.trim() || !newUserRole.trim()) return;

    try {
      // Check if fingerprint registration is complete
      const response = await fetch('/api/user/pending-position');
      const data = await response.json();

      if (!data.position) {
        alert('Please complete fingerprint registration first before saving user information.');
        return;
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name: newUserName.trim(),
        role: newUserRole.trim(),
        last_access: new Date().toISOString(),
        fingerprint_status: 'enrolled',
        positionFingerprint: data.position
      };

      // Save user to persistent storage
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      setNewUserName('');
      setNewUserRole('');
      setIsEnrolling(false);
      setIsWaitingForFingerprint(false);
      mutateUser();

      // Clear the enroll command after saving user
      await fetch('/api/command', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleCancelEnroll = async () => {
    setIsEnrolling(false);
    setNewUserName('');
    setNewUserRole('');

    // Clear the enroll command
    try {
      await fetch('/api/command', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing command:', error);
    }
  };

  if (isEnrolling) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">New User Enrollment</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Please enter the new user's information and follow the fingerprint sensor instructions.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter user name"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              placeholder="Enter user role"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveUser}
              disabled={!newUserName.trim() || !newUserRole.trim()}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Save & Enroll
            </button>
            <button
              onClick={handleCancelEnroll}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
      </div>
      <div className="p-4 space-y-4">
        {userData ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                {userData.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{userData.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500">{userData.role || 'User'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Last Access</p>
                <p className="font-medium">{userData.last_access ? new Date(userData.last_access).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Fingerprint Status</p>
                <p className={`font-medium ${userData.fingerprint_status === 'enrolled' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {userData.fingerprint_status || 'Not enrolled'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading user information...</p>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Enrollments</h3>
          {enrollData?.results?.slice(-3).map((result: any, index: number) => (
            <div key={index} className="flex justify-between items-center py-1 text-sm">
              <span className="text-gray-600">ID: {result.id}</span>
              <span className={`font-medium ${result.result === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {result.result}
              </span>
            </div>
          )) || <p className="text-sm text-gray-500">No recent enrollments</p>}
        </div>
      </div>
    </div>
  );
}
