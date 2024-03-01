import { Schema, model, Types } from "mongoose";

const cartItemSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      required: true,
      ref: "Product",
    },
    colorCode: { type: String, required: true },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const cartSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
});

cartSchema.methods.addToCart = function (productId, colorCode, size) {
  const existingProduct = this.cart?.items?.find(
    (p) =>
      p.product?.toString() === productId &&
      p.colorCode === colorCode &&
      p.size === size
  );

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    this.cart.items.push({ product: productId, colorCode, size, quantity: 1 });
  }
  return this.save();
};

cartSchema.methods.deleteFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.productId.toString() !== productId
  );
  return this.save();
};

const Cart = model("Cart", cartSchema);

export default Cart;
