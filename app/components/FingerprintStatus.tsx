'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FingerprintStatus() {
  const { data, error } = useSWR('/api/enroll_result', fetcher, { refreshInterval: 2000 });

  if (error) return <div className="p-4 bg-red-100 text-red-800 rounded">Failed to load enroll results</div>;
  if (!data) return <div className="p-4 bg-gray-100 rounded">Loading...</div>;

  const results = data.results || [];

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Fingerprint Enrollment Results</h2>
      <ul className="space-y-2">
        {results.map((result: any, index: number) => (
          <li key={index} className="p-2 bg-gray-50 rounded">
            <strong>ID:</strong> {result.id} - <strong>Result:</strong> {result.result} - <strong>Time:</strong> {result.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}
