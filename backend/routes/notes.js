const express = require("express");
var fetchuser = require("../middleware/fetchuser");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");






// ROUTE-1 Get all the notes: POST "/api/auth/fetchallnotes *Login required"
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } 
  catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occurred");
  }
});

 




// ROUTE-2 Add a new note using POST request: POST "/api/auth/addnote *Login required"
router.post("/addnote", fetchuser, 
[
    body("title", "Enter a valid title").isLength({min: 3}),
    body("description", "write the description").isLength({min: 5}),
]
, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Note({
      title,
      description,
      tag,
      user: req.user.id,
    });

    const savedNote = await note.save();

    res.json(savedNote);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occurred");
  }
});




// ROUTE-3 Update an existing notes: POST "/api/notes/updatenote/:id *Login required"
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  
  
      const { title, description, tag } = req.body;  
      // Create a newnote object
      const newNote = {}
      if(title){newNote.title = title}
      if(description){newNote.description = description}
      if(tag){newNote.tag = tag} 

      // Find the note to be updated and update it 
      let note = await Note.findById(req.params.id)
      if(!note){return res.status(404).send("Not found")}
      
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not allowed")
      }
            
      note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
      res.json({note})
  
});




// ROUTE-4 Delete an existing notes: POST "/api/notes/deletenote/:id *Login required"
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  
  
  

  // Find the note to be deleted and delete it 
  let note = await Note.findById(req.params.id)
  if(!note){return res.status(404).send("Not found")}
  

  // Allow deletion only if owns this note
  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not allowed")
  }
        
  note = await Note.findByIdAndDelete(req.params.id)
  res.json({"Success": "Note has been deleted",note: note})
});




module.exports = router;
