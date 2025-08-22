// Loads .env contents into process.env by default.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // ✅ Import mongoose

// router
const router = require('./Routes/router');
const jwtMiddleware = require('./Middlewares/jwtMiddlewares');

// create an express application
const rbServer = express();

rbServer.use(cors());

// this is middleware to convert json file to object
rbServer.use(express.json());

// router use
rbServer.use(router);

// export uploads file rbServer
rbServer.use('/uploads', express.static('./uploads'));

console.log(process.env.DATABASE);


// ✅ MongoDB connection using env
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// Port setup
const PORT = process.env.PORT || 4000;

rbServer.listen(PORT, () => {
  console.log(`🚀 Recipe Book Server started at Port: ${PORT} and Waiting for Client Requests!!!!`);
});

// http get request resolving to http://localhost:4000/
rbServer.get('/', (req, res) => {
  res.send(`<h1>🍲 Recipe Book Server Started and Waiting For Client Requests..!!!!</h1>`);
});
