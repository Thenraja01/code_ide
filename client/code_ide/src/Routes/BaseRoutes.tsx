import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import ErrorBoundary from '@/components/Editor/parts/ErrorBoundary'

// Layouts (DO NOT lazy load these)
import Layout from '@/components/layout/Layout'
import AuthLayout from '@/components/layout/AuthLayout'
import DashBoardLayout from '@/components/layout/DashBoardLayout'
import EditorLayout from '@/components/layout/EditorLayout'

// Public
import Home from '@/pages/Home/Home'
const Docs = lazy(() => import('@/pages/Docs/Docs'))

// Auth
import Login from '@/pages/Login/Login'
import Signup from '@/pages/Login/Signup'

// Dashboard
const DashHome = lazy(() => import('@/pages/Dashboard/Home'))
const Todo = lazy(() => import('@/pages/Dashboard/todo/Todo'))
const Projects = lazy(() => import('@/pages/Dashboard/Projects'))
const Templates = lazy(() => import('@/pages/Dashboard/Templates'))
const Starred = lazy(() => import('@/pages/Dashboard/Starred'))
const Settings = lazy(() => import('@/pages/Dashboard/Settings'))

// Editor / Rare
const CodeEditor = lazy(() => import('@/components/Editor/CodeEditor'))
const ProfilePage = lazy(() => import('@/components/UserProfile/ProfilePage'))
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'))

export default function BaseRoutes() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center animate-pulse shadow-xl shadow-primary/10">
              <span className="text-white text-xs font-bold">CS</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-0.5 w-24 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-progress-loading" />
              </div>
              <span className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-bold mt-2">Loading Workspace</span>
            </div>
          </div>
        }
      >
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
          <Route element={<ProtectedRoute />}>

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashBoardLayout />}>
              <Route index element={<DashHome />} />
              <Route path="home" element={<DashHome />} />
              <Route path="todo" element={<Todo />} />
              <Route path="projects" element={<Projects />} />
              <Route path="templates" element={<Templates />} />
              <Route path="starred" element={<Starred />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Editor */}
            <Route path="/dashboard/editor/:projectId" element={<EditorLayout />}>
              <Route index element={<CodeEditor />} />
            </Route>

          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
