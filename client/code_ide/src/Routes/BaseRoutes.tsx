import { Route, Routes } from 'react-router-dom'
import Layout from '../layers_UI/utils/Layouts/Layout'
import Home from '../layers_UI/Home/Home'
import Docs from '@/layers_UI/Docpage/Docs.tsx'
import Login from '@/layers_UI/Login/Login'
import AuthLayout from '@/layers_UI/utils/Layouts/AuthLayout'
import Signup from '@/layers_UI/Login/Signup'
import Dashboard from '@/layers_UI/Section/Dashboard/Dashboard'
import CodeEditor from '@/components/Editor/CodeEditor'
import DashBoardLayout from '@/layers_UI/utils/Layouts/DashBoardLayout'
import DashHome from '@/layers_UI/Home/DashHome'
import ProtectedRoute from '@/layers_UI/utils/ProtectedRoute'
import Todo from '@/layers_UI/Section/todo/Todo'
import Framework from '@/components/FramWork/Framework'

export default function BaseRoutes() {
  return (
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
      {/* <Route element={<ProtectedRoute />}> */}
        <Route path="dashboard" element={<DashBoardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<DashHome />} />
          <Route path="editor" element={<Framework />} />
          <Route path="todo" element={<Todo />} />
          <Route path="settings" element={<Signup />} />
        </Route>
      {/* </Route> */}

      {/* <Route path="*" element={<Error />} /> */}
    </Routes>
  )
}
