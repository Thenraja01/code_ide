import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

const Layout = lazy(() => import('@/layers_UI/utils/Layouts/Layout'))
const AuthLayout = lazy(() => import('@/layers_UI/utils/Layouts/AuthLayout'))
const DashBoardLayout = lazy(() => import('@/layers_UI/utils/Layouts/DashBoardLayout'))
const EditorLayout = lazy(() => import('@/layers_UI/utils/Layouts/EditorLayout'))

const Home = lazy(() => import('@/layers_UI/Home/Home'))
const Docs = lazy(() => import('@/layers_UI/Docpage/Docs'))
const Login = lazy(() => import('@/layers_UI/Login/Login'))
const Signup = lazy(() => import('@/layers_UI/Login/Signup'))
const Dashboard = lazy(() => import('@/layers_UI/Section/Dashboard/Dashboard'))
const DashHome = lazy(() => import('@/layers_UI/Home/DashHome'))
const Todo = lazy(() => import('@/layers_UI/Section/todo/Todo'))
const CodeEditor = lazy(() => import('@/components/Editor/CodeEditor'))
const ProfilePage = lazy(() => import('@/components/UserProfile/ProfilePage'))
import ProtectedRoute from '@/layers_UI/utils/ProtectedRoute'

export default function BaseRoutes() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-background text-muted-foreground animate-pulse">Loading CodeSpace...</div>}>
      <Routes>
        {/* Public marketing routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="docs" element={<Docs />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashBoardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="home" element={<DashHome />} />
            <Route path="todo" element={<Todo />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="starred" element={<Dashboard />} />
            <Route path="projects" element={<Dashboard />} />
            <Route path="recent" element={<Dashboard />} />
            <Route path="settings" element={<Signup />} />
          </Route>

          {/* Independent Editor View (still under dashboard path) */}
          <Route path="dashboard/editor/:projectId" element={<EditorLayout />}>
            <Route index element={<CodeEditor />} />
          </Route>
        </Route>


        {/* <Route path="*" element={<Error />} /> */}
      </Routes>
    </Suspense>
  )
}

