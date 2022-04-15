
   
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ListingController = require("./controllers/listingController")

const app = express();
const PORT = process.env.PORT ?? 2000
const MONGODB_URI = "mongodb://localhost:27017/listings"//process.env.MONGODB_URI ?? "mongodb://localhost:27017/listings"

// Error / Disconnection
mongoose.connection.on("error", (err) =>
  console.log(err.message + " is Mongod not running?")
);
mongoose.connection.on("disconnected", () => console.log("mongo disconnected"));


mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
});
mongoose.connection.once("open", () => {
  console.log("connected to mongoose...");
});

app.use(cors());
app.use(express.json());
app.use("/api/listings", ListingController)


app.get("/", (req, res) => {
    res.send('Welcome to Reallistic');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})