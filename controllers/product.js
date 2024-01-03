const Product = require("../models/product");

exports.getProducts = async function (req, res, next) {
  const products = await Product.find();
  res.json(products);
};

exports.getProduct = async function (req, res, next) {
  const productId = req.params.id;
  const activeColor = req.query.color;

  const product = await Product.findOne({ _id: productId });
  if (activeColor) {
    product.colors = product.colors.filter(
      (color) => color.colorCode === activeColor
    );
  }
  res.json(product);
};

exports.getProductColors = async function (req, res) {
  const productId = req.params.id;
  const product = await Product.findOne(
    { _id: productId },
    { "colors.colorCode": 1, "colors.squarishUrl": 1 }
  );
  res.json(product.colors);
};
