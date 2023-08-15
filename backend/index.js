const connectToMongo = require('./db.js')

const express = require('express')
const app = express()
const port = 4000

app.use(express.json())

// app.get('/', (req, res) => {
//   res.send(`Hello world`) 
// })

// Available routes
app.use("/api/auth", require('./routes/auth'))
app.use("/api/notes", require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

connectToMongo();