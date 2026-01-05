const connectToMongo = require('./db.js');
const app = require('./app');
const os = require('os');

const port = process.env.PORT || 5000;

connectToMongo();

app.listen(port, () => {
  console.log(`iKeep backend listening on port ${port} at host ${os.hostname()}`);
});