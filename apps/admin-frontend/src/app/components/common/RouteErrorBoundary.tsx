import React from 'react';
import { useRouteError, useNavigate } from 'react-router';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';

export default function RouteErrorBoundary() {
  const error: any = useRouteError();
  const navigate = useNavigate();

  console.error('[RouteErrorBoundary] Caught route error:', error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-3xl border border-[#E7DED6] shadow-sm max-w-xl mx-auto my-12">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={32} />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        {error?.message || 'An unexpected error occurred while loading this page. Please try refreshing or return to the dashboard.'}
      </p>

      <div className="flex gap-4">
        <Button
          onClick={() => window.location.reload()}
          className="bg-[#FF7A00] hover:bg-[#E66E00] text-white flex items-center gap-2 font-bold px-6 py-5 rounded-xl"
        >
          <RefreshCw size={18} />
          Reload Page
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="border-[#E7DED6] text-gray-700 flex items-center gap-2 font-bold px-6 py-5 rounded-xl"
        >
          <Home size={18} />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
