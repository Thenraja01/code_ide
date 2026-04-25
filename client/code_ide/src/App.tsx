import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from '@/components/Provider/themeprovider'
import BaseRoutes from "@/Routes/BaseRoutes"
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <BaseRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
