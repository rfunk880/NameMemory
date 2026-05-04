'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.11 8.11A7.5 7.5 0 0 0 4.5 12c0 4.142 3.358 7.5 7.5 7.5 1.48 0 2.86-.43 4.03-1.17M12 4.5a7.5 7.5 0 0 1 7.5 7.5c0 1.21-.29 2.36-.8 3.37M12 4.5v.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re offline</h1>
        <p className="text-gray-500 mb-6">Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
