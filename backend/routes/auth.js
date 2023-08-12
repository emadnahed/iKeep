const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "AL-ZAIDI2MANAMA4BAHRAIN@T#7763";
var jwt = require("jsonwebtoken");

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
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occurred");
    }

    


}
);

module.exports = router;
