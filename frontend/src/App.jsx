import { Routes,Route,Navigate } from "react-router-dom"
import Home from "./page/Home"
import Login from "./page/Login"
import SignUp from "./page/Signup.jsx"

function App() {
  let authUser = null 
  return (
    <div className="flex flex-col items-center justify-start " >
      <Routes>
        <Route  path="/" element={ authUser ? <Home/>: <Navigate to={"/login"}/> } />
        <Route  path="/login" element={ !authUser ? <Login/> :<Navigate to={"/"}/>  } />
        <Route  path="/signup" element={!authUser ? <SignUp/>:<Navigate to={"/"}/> } />
      </Routes>
    </div>
  )
}

export default App
