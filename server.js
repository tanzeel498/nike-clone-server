const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");

const shopRoutes = require("./routes/shop");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(shopRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected!");
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
