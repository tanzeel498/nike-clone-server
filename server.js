require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./models/user");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected!");
    app.listen(PORT, () => console.log(`server started on ${PORT}`));
  })
  .catch((err) => console.log(err));
