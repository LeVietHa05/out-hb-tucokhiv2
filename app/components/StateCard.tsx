'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StateCard() {
  const { data, error } = useSWR('/api/state', fetcher, { refreshInterval: 2000 });

  if (error) return <div className="p-4 bg-red-100 text-red-800 rounded">Failed to load state</div>;
  if (!data) return <div className="p-4 bg-gray-100 rounded">Loading...</div>;

  const state = data.state || {};

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Machine State</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(state).map(([key, value]) => (
          <div key={key} className="p-2 bg-gray-50 rounded">
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
}
