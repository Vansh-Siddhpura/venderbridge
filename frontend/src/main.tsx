import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { routes } from '@/router/router';
import './index.css';

import { ThemeProvider } from '@/components/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              fontSize: '14px',
              padding: '10px 14px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
