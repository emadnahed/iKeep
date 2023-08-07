const connectToMongo = require('./db.js')

const express = require('express')
const app = express()
const port = 5000


app.get('/', (req, res) => {
  res.send(`Hello world`)
    
})


app.get('/api', (req, res) => {
  res.send(`Hello API`)    
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

connectToMongo();