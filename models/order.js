import { Schema, model, Types } from "mongoose";
import { addressSchema } from "./user.js";

const orderItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, required: true, ref: "Product" },
    colorCode: { type: String, required: true },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
  },
  { _id: false }
);

const cardSchema = new Schema(
  {
    cardNumber: { type: Number, required: true },
    cvv: { type: Number, required: true },
    expiryDate: { type: String, required: true },
    saveCardInfo: { type: Boolean, required: true },
    billingAddress: addressSchema,
  },
  { _id: false }
);

const orderSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  address: addressSchema,
  paymentId: { type: String, required: true },
  totalAmount: { type: Number, required: true },
});

const Order = model("Order", orderSchema);

export default Order;
