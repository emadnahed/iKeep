const express = require('express');
const router = express.Router();
const User = require("../models/User")
const { body, validationResult } = require('express-validator');

// Create a user using: POST "/api/auth/"
router.post(
    '/', 
    [
        body('email', 'invalid credentials-email').isEmail(),
        body('name', 'invalid credentials').isLength({min:3}),
        body('password', 'invalid credentials').isAlphanumeric()
    ]
    ,(req, res) => {
        
        // console.log(req.body)
        // const user = User(req.body)
        // user.save()
        
        
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        User.create({
            email : req.body.email,
            name  : req.body.name,
            password  : req.body.password,
        }).then(user => res.json(user))
        .catch(err=> {console.log(err)
        res.json({err: "Please enter a unique email", message: err.message})
    })

        
    }
)

module.exports = router