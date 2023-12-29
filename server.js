const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");

const shopRoutes = require("./routes/shop");
const User = require("./models/user");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  User.findOne()
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(shopRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected!");
    User.findOne().then((user) => {
      if (!user) {
        const newUser = new User({
          email: "tanzeel@test.com",
          name: "Tanzeel",
          cart: { items: [] },
        });
        newUser.save();
      }
    });
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
