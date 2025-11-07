import { useState } from 'react'

import { BrowserRouter,Route,Routes,Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Home from './Home'
// import Notfound from './NotFound'
import Register from './pages/register'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './ProtectedRoutes'


function Logout(){
  localStorage.clear();
  return <Navigate to ="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register/>
}

function App() {
  const [count, setCount] = useState(0)



  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route  
      path="/"
      element={
        <ProtectedRoute>
          <Home/>
        </ProtectedRoute>
      }
      />
      <Route path='/login' element={<Login/>} />
      <Route path='/register'  element={<RegisterAndLogout />}/>
      <Route path='/logout' element={<Logout/>} />
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/reset-password" element={<ResetPassword/>} />
      {/* <Route path="*" element={<Notfound/>} /> */}
    </Routes>
    </BrowserRouter>    
    </>
  )
}

export default App