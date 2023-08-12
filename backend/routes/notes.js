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

module.exports = router;
