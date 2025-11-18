'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ActivityLogs() {
  const { data: logsData, error: logsError } = useSWR('/api/logs', fetcher, { refreshInterval: 2000 });
  const { data: qrData, error: qrError } = useSWR('/api/qr', fetcher, { refreshInterval: 1000 });

  const logs = logsData?.logs || [];
  const action = qrData?.action;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
      </div>
      <div className="p-4">
        {/* QR Action Notification */}
        {action && (
          <div className={`mb-4 p-3 rounded-lg ${
            action.type === 'borrow' ? 'bg-green-50 text-green-800 border border-green-200' :
            action.type === 'return' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            action.type === 'login_required' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            <div className="font-medium">
              {action.type === 'borrow' ? '📖 Borrowed' :
               action.type === 'return' ? '📚 Returned' :
               action.type === 'login_required' ? '🔐 Login Required' :
               '⚠️ Error'}
            </div>
            <div className="text-sm mt-1">{action.message}</div>
          </div>
        )}

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
