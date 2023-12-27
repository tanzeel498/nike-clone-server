const Product = require("../models/product");

exports.getProducts = async function (req, res, next) {
  const products = await Product.find();
  // console.log(products);
  res.json(products);
};

exports.getProduct = async function (req, res, next) {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  // console.log(product);
  res.json(product);
};
