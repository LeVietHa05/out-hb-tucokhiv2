'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ImageDisplay() {
  const { data, error } = useSWR('/api/image', fetcher, { refreshInterval: 5000 });

  if (error) return <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">Failed to load image</div>;
  if (!data) return <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">Loading image...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Live Camera Feed</h2>
        <p className="text-sm text-gray-500">Last updated: {new Date(data.time).toLocaleTimeString()}</p>
      </div>
      <div className="flex-1 p-4">
        <img
          src={data.imagePath}
          alt="Tool cabinet camera feed"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      {data.predictions.predictions.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Detected Tools</h3>
          <div className="flex flex-wrap gap-2">
            {data.predictions.predictions.map((tool: any, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tool.class} ({Math.round((tool.confidence || 0) * 100)}%)
              </span>
            )) || <span className="text-sm text-gray-500">No tools detected</span>}
          </div>
        </div>
      )}
    </div>
  );
}
