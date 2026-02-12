import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './components/Provider/themeprovider.tsx'
import BaseRoutes from "./Routes/BaseRoutes.tsx"
function App() {

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        
  <BrowserRouter>
  <BaseRoutes/>
        </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
