import React, { useContext, useEffect } from 'react'
import noteContext from '../context/notes/noteContext'

export default function About() {
  
    const a = useContext(noteContext)

    useEffect(() => {
        a.update()
        // eslint-disable-next-line
    }, [])
    

    return (
    <div className='container'>
      <h1>This is About: {a.iState.name}</h1>
      <h1>This is About: {a.iState.class}</h1>
    </div>
  )
}
