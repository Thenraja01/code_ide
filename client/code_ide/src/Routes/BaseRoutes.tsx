import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Layout from '../layers_UI/utils/Layout'
import  Home   from '../layers_UI/Home/Home'
export default function BaseRoutes() {
    return(
        <BrowserRouter>
          <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home/>} />
        <Route path='/home' element={<Home/>}/>
        </Route>

        {/* <Route path="*" element={<Error/>}/> */}
        </Routes>

        </BrowserRouter>      
      
    )
};
