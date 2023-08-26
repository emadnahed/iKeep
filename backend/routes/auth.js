const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "AL-ZAIDI2MANAMA4BAHRAIN@T#7763";
var jwt = require("jsonwebtoken");
var fetchuser = require('../middleware/fetchuser');

// ROUTE-1 Create a user using: POST "/api/auth/createuser"
router.post(
  "/createuser",
  [
    body("email", "invalid credentials-email").isEmail(),
    body("name", "invalid credentials").isLength({ min: 3 }),
    body("password", "invalid credentials").isAlphanumeric(),
  ],
  async (req, res) => {
    
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check whether the user with the email exists already
    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry, a user with this email already exists" });
      }

      //   Spicing passwords
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //Create a new user
      user = await User.create({
        email: req.body.email,
        name: req.body.name,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });

    } 
    catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occurred");
    }

    // Authenticate a user using: POST "/api/auth/login"
  }
);

// ROUTE-2 Authenticate a user using: POST "/api/auth/login"
router.post(
  "/login",
  [
    body("email", "invalid credentials-email").isEmail(),
    body("password", "P assword cannot be blank").exists(),
  ],
  async (req, res) => {
    // if there are errors, return bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        
        let user = await User.findOne({email})
        if(!user){
            success = false;
            return res.status(400).json({error: "Please use the precise credentials"});
        }
        
        const passwordCompare = await bcrypt.compare(password, user.password)
        if(!passwordCompare){
          success = false  
          return res.status(400).json({success, error: "Please use the precise credentials"})
        }

        const data = {
            user: {
              id: user.id,
            },
          };
    
          const authToken = jwt.sign(data, JWT_SECRET);
          success = true;
          res.json({ success, authToken });
    
    } 
    
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occurred");
    }
  }

  
  
);
// ROUTE-1 Get logged in user details using: POST "/api/auth/getuser *login required"
router.post(
    "/getuser", fetchuser, async (req, res) => {
        
        try {
            userID = req.user.id;
            const user = await User.findById(userID).select("-password")
            res.send({user})
            
        } 
        
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error occurred");
        }

    }) 

module.exports = router;
