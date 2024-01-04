const User = require("../models/user");

exports.getAddress = (req, res) => {
  res.json(req.user.address);
};

exports.postAddress = async (req, res) => {
  req.user.address = req.body;
  const user = await req.user.save();
  res.json(user.address);
};
