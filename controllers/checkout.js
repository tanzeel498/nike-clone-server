const User = require("../models/user");

exports.getAddress = (req, res) => {
  console.log("get address function");
  res.json(req.user.address);
};

exports.postAddress = async (req, res) => {
  req.user.address = req.body;
  const user = await req.user.save();
  res.json(user.address);
};

exports.getPayment = (req, res) => {
  const payment = req.user.payment;
  if (!payment?.saveCardInfo) res.json(null);
  res.json(payment);
};

exports.postPayment = async (req, res) => {
  req.user.payment = req.body;
  const user = await req.user.save();
  res.json(user.payment);
};
