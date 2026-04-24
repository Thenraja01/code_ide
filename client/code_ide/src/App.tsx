import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from '@/components/Provider/themeprovider'
import BaseRoutes from "@/Routes/BaseRoutes"
import { AuthProvider } from "@/context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <BaseRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
