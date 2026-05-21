'use client'
import Link from 'next/link';

export default function OfflineFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#040404] p-4 text-center text-white">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M9.172 9.172a4 4 0 015.656 0M4.222 4.222a10.036 10.036 0 00-1.394 1.394m2.778-2.778A9.956 9.956 0 0112 2c2.76 0 5.26 1.12 7.07 2.93m-14.14 0A9.953 9.953 0 002 12c0 2.76 1.12 5.26 2.93 7.07m14.14 0A9.956 9.956 0 0022 12c0-2.76-1.12-5.26-2.93-7.07"
          />
        </svg>
      </div>
      
      <h1 className="mb-4 text-4xl font-bold tracking-tight">You are offline</h1>
      <p className="mb-8 max-w-[400px] text-lg text-gray-400">
        It looks like you've lost your internet connection. EyE PunE is currently running in offline mode.
      </p>
      
      <button 
        onClick={() => window.location.reload()}
        className="rounded-full bg-red-600 px-8 py-3 font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
      >
        Try Again
      </button>
      
      <div className="mt-12 text-sm text-gray-600">
        EyE PunE Progressive Web App
      </div>
    </div>
  );
}
