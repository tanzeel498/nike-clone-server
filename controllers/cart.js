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
        remainingItem.skus = color.skus;
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
  await req.user.addToCart(id, colorCode, size);
  res.json({ success: true });
};

exports.postUpdateCartItem = async (req, res) => {
  const { id: cartItemId, ...data } = req.body;

  const cartItem = req.user.cart.items.id(cartItemId);
  cartItem.set({ ...cartItem._doc, ...data });
  await req.user.save();
  res.json({ success: true });
};

exports.postDeleteCartItem = async (req, res) => {
  const cartItemId = req.body.id;
  req.user.cart.items.id(cartItemId).deleteOne();
  await req.user.save();
  res.json({ success: true });
};
