const bcrypt = require("bcrypt");
const User = require("../models/user");

const saltRounds = 10;

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
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    email,
    firstName,
    lastName,
    password: hashedPassword,
    dob,
    emailSignUp,
    tos,
    cart: { items: [] },
  });
  newUser.save().then((user) => {
    const { password, ...userData } = user._doc;
    req.session.user = userData;
    res.json(userData);
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) return res.json(null);
  const { password: userPassword, ...userData } = user._doc;
  req.session.user = userData;
  return res.json(userData);
};

exports.getUser = (req, res) => {
  res.json(req.session);
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.json({ logout: true });
  });
};
