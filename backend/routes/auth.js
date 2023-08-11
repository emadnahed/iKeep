const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// Create a user using: POST "/api/auth/"
router.post(
  "/createuser",
  [
    body("email", "invalid credentials-email").isEmail(),
    body("name", "invalid credentials").isLength({ min: 3 }),
    body("password", "invalid credentials").isAlphanumeric(),
  ],
  async (req, res) => {
    // console.log(req.body)
    // const user = User(req.body)
    // user.save()

    // if there are errors, return bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    // Check whether the user with the email exists already
    let user = await User.findOne({email: req.body.email});
    console.log(req.body)

    if(user){
      return res.status(400).json({ error: "Sorry, a user with this email already exists" });
    }
    

    //Create a new user
    user = await User.create({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    })
    return res.json(req.body);

    //   .then((user) => res.json(user))
    //   .catch((err) => {
    //     console.log(err);
    //     res.json({ err: "Please enter a unique email", message: err.message });
    //   });
  }
);

module.exports = router;
