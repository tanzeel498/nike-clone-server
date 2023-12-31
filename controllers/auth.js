const User = require("../models/user");

exports.postCheckUser = async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  res.json(user);
};
