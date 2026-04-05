import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './components/Provider/themeprovider.tsx'
import BaseRoutes from "./Routes/BaseRoutes.tsx"
import { useAuth } from './layers_UI/utils/Context/AuthContext.tsx'
import { useMeQuery } from './hooks/useAuth.hooks.ts'
import { useEffect } from 'react'


function App() {
  const { data: user, isFetching } = useMeQuery()
  const { setUser } = useAuth()

  useEffect(() => {
    if (user) {
      setUser(user as any)
    }
  }, [user, setUser])

  if (isFetching && !user) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <BaseRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
