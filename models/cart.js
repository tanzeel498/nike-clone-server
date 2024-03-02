import { Schema, model, Types } from "mongoose";

const cartItemSchema = new Schema({
  product: {
    type: Types.ObjectId,
    required: true,
    ref: "Product",
  },
  colorCode: { type: String, required: true },
  size: { type: Number, required: true },
  quantity: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
});

const cartSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
});

const Cart = model("Cart", cartSchema);

export default Cart;
