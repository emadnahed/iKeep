import React, { useEffect, useContext, useState } from "react";
import Notes from "./Notes";
import noteContext from "../context/notes/noteContext";
import { useNavigate } from "react-router-dom"

export default function Home(props) {

  const context = useContext(noteContext);
  const { notes, getNotes } = context;
  const { showAlert } = props
  let history = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('token') == null) {
      history("/welcome")
    }
    else {
      getNotes()
      setIsLoading(false);
    }
  }, []);

  // Show nothing while checking auth to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <div>
      <Notes showAlert={showAlert} />
    </div>
  );
}
