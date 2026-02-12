import {  Route, Routes } from 'react-router-dom'
import Layout from '../layers_UI/utils/Layout'
import Home from '../layers_UI/Home/Home'
import Docs from '@/layers_UI/Docpage/Docs.tsx'
import Login from '@/layers_UI/Login/Login'
import AuthLayout from '@/layers_UI/Login/AuthLayout'
import Signup from '@/layers_UI/Login/Signup'
export default function BaseRoutes() {
    return (
      
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path='/home' element={<Home />} />
                    <Route path='/docs' element={<Docs />} />
                </Route>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>


                {/* <Route path="*" element={<Error/>}/> */}
            </Routes>

      

    )
};
