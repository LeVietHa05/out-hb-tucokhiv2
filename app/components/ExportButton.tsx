'use client';

import { useState } from 'react';

export default function SimpleExportButtonTW() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleExport = async (): Promise<void> => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/export?format=excel');

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export_${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export error:', err);
            alert('Export failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isLoading}
            className={`
        px-6 py-3 
        bg-green-500 
        text-white 
        rounded-lg 
        font-medium 
        hover:bg-green-600 
        active:bg-green-700 
        disabled:opacity-70 
        disabled:cursor-not-allowed 
        transition-all 
        duration-200 
        hover:-translate-y-0.5 
        active:translate-y-0
        flex items-center justify-center gap-2
        min-w-[140px]
      `}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    Exporting...
                </>
            ) : (
                'Export Excel'
            )}
        </button>
    );
}