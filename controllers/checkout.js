const User = require("../models/user");

exports.getAddress = (req, res) => {
  res.json(req.user.address);
};

exports.postAddress = async (req, res) => {
  req.user.address = req.body;
  const user = await req.user.save();
  res.json(user.address);
};

exports.getPayment = (req, res) => {
  const payment = req.user.payment;
  payment.cards = payment.cards.filter((card) => card.saveCardInfo);
  console.log(payment);
  res.json(payment);
};

exports.postPayment = async (req, res) => {
  req.user.payment.push(req.body);
  const user = await req.user.save();
  res.json(user.payment);
};
