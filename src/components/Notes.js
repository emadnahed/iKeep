import React from 'react'
import { useContext } from "react";
import noteContext from "../context/notes/noteContext";
import Noteitem from './Noteitem';

export default function Notes() {
    const context = useContext(noteContext)
    const {notes, setNotes} = context;
    return (
    <div className="row my-3">
        <h1>Your existing Notes: </h1>
        {notes.map((note)=> {
          return <Noteitem title={note.title} description={note.description} tag={note.tag}/>
        })}
      </div>
  )
}
