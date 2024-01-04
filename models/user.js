const { Schema, model } = require("mongoose");

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  colorCode: { type: String, required: true },
  size: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const cartSchema = new Schema(
  {
    items: [cartItemSchema],
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    apt: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: Number, required: true },
  },
  { _id: false }
);

const userSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  dob: String,
  emailSignUp: Boolean,
  tos: Boolean,
  cart: cartSchema,
  address: addressSchema,
});

userSchema.methods.addToCart = function (productId, colorCode, size) {
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

userSchema.methods.deleteFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.productId.toString() !== productId
  );
  return this.save();
};

userSchema.methods.clearCart = async function () {
  this.cart = { items: [] };
  this.save();
};

module.exports = model("User", userSchema);
