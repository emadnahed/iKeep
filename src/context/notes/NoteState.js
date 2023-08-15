import NoteContext from "./noteContext";
import React, { useState } from "react";



const NoteState = (props) => {
    const notesInitial = [
        {
          "_id": "64d9a36f34cc2ceaacc2c1ef",
          "user": "64d6ca4939879f7d77e72881",
          "title": "Jurasssic Park is amazing",
          "description": "Welcowme to the Jurassic Park",
          "tag": "picnic",
          "date": "2023-08-14T03:45:51.155Z",
          "__v": 0
        },
        {
          "_id": "64db091de20f3fc9199ce754",
          "user": "64d6ca4939879f7d77e72881",
          "title": "Pune is amazing",
          "description": "Welcowme to the Pune City",
          "tag": "Tourism",
          "date": "2023-08-15T05:11:57.985Z",
          "__v": 0
        },
        {
          "_id": "64db0933e20f3fc9199ce757",
          "user": "64d6ca4939879f7d77e72881",
          "title": "Vegas is amazing",
          "description": "Welcowme to the Vegas City",
          "tag": "Tourism",
          "date": "2023-08-15T05:12:19.764Z",
          "__v": 0
        },
        {
          "_id": "64db0945e20f3fc9199ce759",
          "user": "64d6ca4939879f7d77e72881",
          "title": "Agra is amazing",
          "description": "Welcowme to the Agra City",
          "tag": "Tourism",
          "date": "2023-08-15T05:12:37.042Z",
          "__v": 0
        },
        {
          "_id": "64db095ce20f3fc9199ce75b",
          "user": "64d6ca4939879f7d77e72881",
          "title": "Nuh is amazing",
          "description": "Welcowme to the Nuh City",
          "tag": "Tourism",
          "date": "2023-08-15T05:13:00.221Z",
          "__v": 0
        },
        {
          "_id": "64db0973e20f3fc9199ce75d",
          "user": "64d6ca4939879f7d77e72881",
          "title": "Vienna is amazing",
          "description": "Welcowme to the UK City",
          "tag": "Tourism",
          "date": "2023-08-15T05:13:23.341Z",
          "__v": 0
        }
      ]
      const [notes, setNotes] = useState(notesInitial)
    
    
      return  (
        <NoteContext.Provider value={{notes, setNotes}}>        
        {props.children}
        </NoteContext.Provider>        
    )
}


export default NoteState