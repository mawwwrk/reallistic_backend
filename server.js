require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ListingController = require("./controllers/listingController");
const AuthController = require("./controllers/auth");
const morgan = require("morgan");
const morganFmt = process.env.NODE_ENV === "development" ? "dev" : "tiny";

const app = express();
const PORT = process.env.PORT ?? 2000;
const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/listings";

// Error / Disconnection
mongoose.connection
  .on("error", (err) => console.log(err.message + " is Mongod not running?"))
  .on("disconnected", () => console.log("mongo disconnected"))
  .once("open", () => {
    console.log("connected to mongoose...");
  });

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
});
mongoose.connection.once("open", () => {
  console.log("connected to mongoose...");
});

app
  .use(morgan(morganFmt))
  .use(
    cors({
      credentials: true,
      origin: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
)
  .use(express.json())
  .use("/api/listings", ListingController)
  .use("/auth", AuthController);

app.get("/", (req, res) => {
  res.send("Welcome to Reallistic");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
