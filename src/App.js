import Navbar from "./components/Navbar"
import Home from "./components/Home"
import About from "./components/About"
import Welcome from "./components/Welcome"
import './App.css';
import NoteState from "./context/notes/NoteState";
import React, { useContext, useEffect, useRef, useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Alert from "./components/Alert";
import Footer from "./components/Footer"; // Import the Footer component
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

  const showAlert = (message, type) => {
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

          <Navbar />
          <Alert alert={alert} />
          <div className="app-content">
            <Switch>
              <Route exact path="/" element={<Home showAlert={showAlert} />} />
              <Route exact path="/welcome" element={<Welcome />} />
              <Route exact path="/about" element={<About />} />
              <Route exact path="/Login" element={<Login showAlert={showAlert} />} />
              <Route exact path="/Signup" element={<Signup showAlert={showAlert} />} />
            </Switch>
          </div>
          <Footer />
        </Router>

      </NoteState>
    </>
  );
}

export default App;
