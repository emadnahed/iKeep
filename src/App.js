import Navbar from "./components/Navbar"
import Home from "./components/Home"
import About from "./components/About"
import './App.css';
import NoteState from "./context/notes/NoteState";


import {
  BrowserRouter as Router,
  Routes as Switch,
  Route,
  
} from "react-router-dom";



function App() {
  return (
    <> 
    <NoteState>

          <Router>
            
                <Navbar/>            
                <div className="container">
                <Switch>                                  
                      <Route exact path="/" element={<Home/>} />
                      <Route exact path="/about" element={<About/>} />          
                </Switch>
                </div>
          </Router>

      </NoteState>
      </>
  );
}

export default App;
