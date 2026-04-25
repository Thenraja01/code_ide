import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConvexProvider, ConvexReactClient } from "convex/react"
import './index.css'
import App from '@/App'
import { AuthProvider } from '@/context/AuthContext'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "http://localhost:3001");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ConvexProvider client={convex}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConvexProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
