import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient singleton for the mobile app.
 * Allows AuthContext and screens to invalidate or clear the query cache on logout.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});
