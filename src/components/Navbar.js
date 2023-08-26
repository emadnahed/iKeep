import React  from 'react'
import {useNavigate} from "react-router-dom"
import { useLocation, Link} from "react-router-dom";


export default function Navbar() {
  
  //Use location hook to track where the existing pointer is:
  let location = useLocation();
  let navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  

  return (    
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{'backgroundColor' : '#000000'}}>
  <div className="container-fluid">
    <Link className="navbar-brand " to="/">iKeep</Link>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className={`nav-link ${location.pathname === "/" ? "active": ""}`} aria-current="page" to="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${location.pathname === "/about" ? "active": ""}`} to="/about">About</Link>
        </li>
        
         
      
      </ul>
      <form className="d-flex" role="search">
        
        {!localStorage.getItem('token') ? 
        <>
        <Link  className="btn btn-primary mx-1" to='/login' role="button">Login </Link>
        <Link className="btn btn-primary mx-1" to='/signup' role="button">Sign up </Link>
        </>
        : 
        <Link className="btn btn-primary mx-1" to='/signup' role="button" onClick={handleLogout}>Log Out </Link>
        }
        
        
        
        
        

      </form>
    </div>
  </div>
</nav>
  )
}
