// getting-started.js
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ikeeper';
// const mongoURI = ('mongodb://127.0.0.1:27017/test');

function nonCallback(){
    console.log("Connected to Mongoose")
}

const connectToMongo = () => {
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => nonCallback())
        .catch(err => console.log(err));
}

module.exports = connectToMongo