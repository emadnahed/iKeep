var jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const fetchuser = (req, res, next) => {
    // get the user from the JWT token and append id to the req object
    const token = req.header('auth-token')

    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }


    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user
        next()
    }
    catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
}

module.exports = fetchuser