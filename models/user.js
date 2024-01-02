const { Schema, model } = require("mongoose");

const cartSchema = new Schema(
  {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        colorCode: { type: String, required: true },
        size: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
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
});

userSchema.methods.addToCart = function (productId, colorCode, size) {
  const existingProduct = this.cart.items?.find(
    (p) => p.productId.toString() === productId && p.colorCode === colorCode
  );

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    this.cart.items.push({ productId, colorCode, size, quantity: 1 });
  }
  return this.save();
};

userSchema.methods.deleteFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.productId.toString() !== productId
  );
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = model("User", userSchema);
