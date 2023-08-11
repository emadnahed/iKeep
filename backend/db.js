// getting-started.js
const mongoose = require('mongoose');
const mongoURI = ('mongodb://localhost:27017/ikeeper?directConnection=true');
// const mongoURI = ('mongodb://127.0.0.1:27017/test');

function nonCallback(){
    console.log("Connected to Mongoose by Isaiah")
}

const connectToMongo = () => {
    mongoose.connect(mongoURI, nonCallback())
}

module.exports = connectToMongo