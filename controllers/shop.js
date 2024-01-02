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

exports.getCart = async (req, res) => {
  const user = await req.user.populate(
    "cart.items.product",
    "title subtitle colors"
  );

  const cart = user.cart.items.map((item) => {
    const { product, ...remainingItem } = item._doc;
    product.colors.forEach((color) => {
      if (color.colorCode === item.colorCode) {
        remainingItem.currentPrice = color.currentPrice;
        remainingItem.fullPrice = color.fullPrice;
        remainingItem.colorDescription = color.colorDescription;
        remainingItem.squarishUrl = color.squarishUrl;
      }
    });
    remainingItem.title = product.title;
    remainingItem.subtitle = product.subtitle;
    remainingItem.productId = product._id;
    return remainingItem;
  });

  res.json(cart);
};

exports.postCart = async function (req, res) {
  const { id, colorCode, size } = req.body;
  const user = await req.user.addToCart(id, colorCode, size);
  const { password, ...userData } = user._doc;
  req.session.user = userData;
  res.json(userData);
};
