const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const User = require("./models/user");

const PORT = process.env.PORT || 3000;
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    store,
  })
);

app.use((req, res, next) => {
  User.findById(req.session?.user?._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(productRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected!");
    app.listen(PORT, () => console.log(`server started on ${PORT}`));
  })
  .catch((err) => console.log(err));
