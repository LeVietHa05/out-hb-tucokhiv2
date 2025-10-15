'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LogConsole() {
  const { data, error } = useSWR('/api/logs', fetcher, { refreshInterval: 2000 });

  if (error) return <div className="p-4 bg-red-100 text-red-800 rounded">Failed to load logs</div>;
  if (!data) return <div className="p-4 bg-gray-100 rounded">Loading...</div>;

  const logs = data.logs || [];

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Log Console</h2>
      <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded">
        {logs.map((log: string, index: number) => (
          <div key={index} className="text-sm">{log}</div>
        ))}
      </div>
    </div>
  );
}
