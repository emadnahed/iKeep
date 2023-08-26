import Navbar from "./components/Navbar"
import Home from "./components/Home"
import About from "./components/About"
import './App.css';
import NoteState from "./context/notes/NoteState";
import React, { useContext, useEffect, useRef, useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Alert from "./components/Alert";
import {
  BrowserRouter as Router,
  Routes as Switch,
  Route,
  
} from "react-router-dom";


// const context = useContext("./context/notes/noteContext");
// const { notes} = context;


// React.useEffect(() => {      
//   console.log("testing")
// }, [notes])  


function App() {
  const [alert, setAlert] = useState(null)
  
  const showAlert = (message, type)=>{
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
        setAlert(null);
    }, 1500);
}

  return (
    <> 
    <NoteState>

          <Router>
            
                <Navbar/>            
                <Alert alert={alert}/>
                <div className="container">
                <Switch>                                  
                      <Route exact path="/" element={<Home showAlert={showAlert}/> } />
                      <Route exact path="/about" element={<About/>} />          
                      <Route exact path="/Login" element={<Login showAlert={showAlert}/>} />          
                      <Route exact path="/Signup" element={<Signup showAlert={showAlert}/>} />          
                </Switch>
                </div>
          </Router>

      </NoteState>
      </>
  );
}

export default App;
