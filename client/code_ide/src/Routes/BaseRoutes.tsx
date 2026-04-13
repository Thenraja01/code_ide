import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/layers_UI/utils/ProtectedRoute'

// Layouts
const Layout = lazy(() => import('@/layers_UI/utils/Layouts/Layout'))
const AuthLayout = lazy(() => import('@/layers_UI/utils/Layouts/AuthLayout'))
const DashBoardLayout = lazy(() => import('@/layers_UI/utils/Layouts/DashBoardLayout'))
const EditorLayout = lazy(() => import('@/layers_UI/utils/Layouts/EditorLayout'))

// Public Pages
const Home = lazy(() => import('@/layers_UI/Home/Home'))
const Docs = lazy(() => import('@/layers_UI/Docpage/Docs'))

// Auth Pages
const Login = lazy(() => import('@/layers_UI/Login/Login'))
const Signup = lazy(() => import('@/layers_UI/Login/Signup'))

// Dashboard Pages
const Dashboard = lazy(() => import('../layers_UI/Section/Dashboard/Dashboard'))
const DashHome = lazy(() => import('../layers_UI/Section/Dashboard/Home'))
const Todo = lazy(() => import('../layers_UI/Section/todo/Todo'))
const Projects = lazy(() => import('../layers_UI/Section/Dashboard/Projects'))
const Recent = lazy(() => import('../layers_UI/Section/Dashboard/Recent'))
const Starred = lazy(() => import('../layers_UI/Section/Dashboard/Starred'))
const Settings = lazy(() => import('../layers_UI/Section/Dashboard/Settings'))

// Others
const CodeEditor = lazy(() => import('@/components/Editor/CodeEditor'))
const ProfilePage = lazy(() => import('@/components/UserProfile/ProfilePage'))
const NotFound = lazy(() => import('@/layers_UI/NotFound/NotFound'))

export default function BaseRoutes() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center animate-pulse">
        Loading CodeSpace...
      </div>
    }>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="docs" element={<Docs />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected */}

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashBoardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="home" element={<DashHome />} />
            <Route path="todo" element={<Todo />} />
            <Route path="projects" element={<Projects />} />
            <Route path="recent" element={<Recent />} />
            <Route path="starred" element={<Starred />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Editor */}
          <Route path="/dashboard/editor/:projectId" element={<EditorLayout />}>
            <Route index element={<CodeEditor />} />
          </Route>

        <Route element={<ProtectedRoute />}>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  )
}
