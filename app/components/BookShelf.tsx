
'use client';

import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Book {
    "id": string,
    "name": string,
    "type": string,
    "qr_code": string,
    "borrowed_by": string | null
}

export default function Bookshelf() {
    const { data, error } = useSWR('/api/book', fetcher, { refreshInterval: 10000 });

    if (error) return <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">Failed to load books</div>;
    if (!data) return <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">Loading books...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border flex flex-col mt-5">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Bookshelf</h2>
                {/* <p className="text-sm text-gray-500">Last updated: {new Date(data.time).toLocaleTimeString()}</p> */}
                <Link className='mt-2 text-blue-500 relative translate-x-0 hover:translate-x-10 transition-all duration-300' href={'/books'}>Add more Book</Link>
            </div>
            {data.length > 0 && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
                    {data.map((each: Book, i: number) => {
                        return (
                            <div key={i} className={`shadow-lg rounded-lg p-2 ${each.borrowed_by ? "bg-red-200" : "bg-green-200"}`}>
                                <div className='text-lg'>
                                    {each.name} <span className='text-[8px]'>  {each.id}</span>
                                </div>
                               <span>{each.borrowed_by ?each.borrowed_by : "co the muon"}</span>
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}