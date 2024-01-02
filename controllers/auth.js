const User = require("../models/user");

exports.postCheckUser = async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (user) return res.json({ user: true });
  res.json(null);
};

exports.verifyOtp = async (req, res, next) => {
  const { email, token } = req.body;
  if (token === "13579") return res.json({ approved: true });
  res.json(null);
};

exports.postSignUp = async (req, res, next) => {
  const { email, firstName, lastName, password, dob, emailSignUp, tos } =
    req.body;
  const newUser = new User({
    email,
    firstName,
    lastName,
    password,
    dob,
    emailSignUp,
    tos,
    cart: { items: [] },
  });
  newUser.save().then((user) => {
    req.session.user = user;
    res.json(user);
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user.password !== password) return res.json(null);
  req.session.user = user;
  return res.json(user);
};

exports.getUser = (req, res) => {
  res.json(req.session);
};

exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.json({ logout: true });
  });
};
