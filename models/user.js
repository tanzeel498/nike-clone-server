import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    apt: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: Number, required: true },
  },
  { _id: false }
);

// const cardSchema = new Schema(
//   {
//     cardNumber: { type: Number, required: true },
//     cvv: { type: Number, required: true },
//     expiryDate: { type: String, required: true },
//     saveCardInfo: { type: Boolean, required: true },
//     billingAddress: addressSchema,
//   },
//   { _id: false }
// );

const userSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: String, required: true },
  emailSignUp: { type: Boolean, required: true },
  tos: { type: Boolean, required: true },
  shippingAddress: addressSchema,
  // payment: cardSchema,
});

const User = model("User", userSchema);
export default User;
