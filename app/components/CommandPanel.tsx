'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CommandPanel() {
  const { data, error } = useSWR('/api/command', fetcher, { refreshInterval: 5000 });
  const [command, setCommand] = useState('');

  const sendCommand = async () => {
    if (!command) return;
    await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    setCommand('');
    mutate('/api/command'); // Refresh the data
  };

  if (error) return <div className="p-4 bg-red-100 text-red-800 rounded">Failed to load command</div>;
  if (!data) return <div className="p-4 bg-gray-100 rounded">Loading...</div>;

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Command Panel</h2>
      <div className="mb-4">
        <strong>Current Command:</strong> {data.command} (at {data.timestamp || 'N/A'})
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command"
          className="flex-1 p-2 border rounded"
        />
        <button onClick={sendCommand} className="px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}
