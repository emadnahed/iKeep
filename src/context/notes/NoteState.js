import NoteContext from "./noteContext";
import React from "react";


const NoteState = (props) => {
    const s1 = {
        "name": "harry",
        "class":"9b" 
    }

    const [iState, setIState] = React.useState(s1)


    const update = () => {
        setTimeout(() => {
            setIState({"name": "harryo", class: "12-C"})
        }, 3000);
    }

    return  (
        <NoteContext.Provider value={{iState, update}}>        
        {props.children}
        </NoteContext.Provider>        
    )
}


export default NoteState