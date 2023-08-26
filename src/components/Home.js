import React, {useEffect, useContext} from "react";
import Notes from "./Notes";
import noteContext from "../context/notes/noteContext";
import {useNavigate} from "react-router-dom"
  
export default function Home(props) {
  
  const context = useContext(noteContext);
  const { notes, getNotes } = context;
  const {showAlert} = props
  let history = useNavigate();
    
  useEffect(() => {
    if(localStorage.getItem('token')== null){
      history("/login")      
    }
    else(
       getNotes()
    )
    
  }, [notes]);

  return (
    <div>
    
      <Notes showAlert={showAlert}/>
    
    </div>
  );
}
