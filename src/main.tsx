import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './services/auth/auth.service.ts';
import { MsalProvider } from '@azure/msal-react';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const pubClientApp = new PublicClientApplication(msalConfig);

createRoot(rootElement).render(

  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App msalInstance={pubClientApp} />
    </QueryClientProvider>
  </StrictMode>

);
