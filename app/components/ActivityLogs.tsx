'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ActivityLogs() {
  const { data, error } = useSWR('/api/logs', fetcher, { refreshInterval: 2000 });

  if (error) return <div className="p-4 bg-red-50 text-red-800 rounded-lg">Failed to load logs</div>;
  if (!data) return <div className="p-4 bg-gray-50 rounded-lg">Loading logs...</div>;

  const logs = data.logs || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
      </div>
      <div className="p-4">
        <div className="h-64 overflow-y-auto space-y-2">
          {logs.slice(-20).reverse().map((log: string, index: number) => {
            // Parse user name from log if present
            const userMatch = log.match(/^\[([^\]]+)\]\s*(.*)$/);
            const userName = userMatch ? userMatch[1] : null;
            const logMessage = userMatch ? userMatch[2] : log;

            return (
              <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                {userName && (
                  <span className="font-medium text-blue-600">{userName}: </span>
                )}
                {logMessage}
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No activity logs available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
