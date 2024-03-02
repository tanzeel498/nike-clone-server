import validator from "validator";
import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";
import Stripe from "stripe";

import User from "../models/user.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import SignUpCode from "../models/signupCode.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: { user: "tanzeel498@gmail.com", pass: process.env.BREVO_SMTP_KEY },
});

class UserDoc {
  constructor(user) {
    this._id = user._id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.shippingAddress = user.shippingAddress;
  }
}

function createJWT(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "5 days",
    }
  );
}

async function generateCode(email) {
  await SignUpCode.deleteOne({ email });
  const code = Math.round(Math.random() * 1000000);
  const codeObj = new SignUpCode({
    email,
    code,
    expiry: Date.now() + 5 * 60 * 1000,
  });
  await codeObj.save();
  return code;
}

const graphqlResolvers = {
  Query: {
    join: async function (_, { email }) {
      // check for validation of email
      if (!validator.isEmail(email))
        throw new GraphQLError("Enter a valid email!");

      // check if user exists in DB
      const user = await User.findOne({ email });
      if (user) return 200;
      // generate code and send to email
      const code = await generateCode(email);
      await transporter.sendMail({
        from: "'Nike Clone' <nikeclone@noreply.com>",
        to: email,
        subject: `Here's your verification code ${code}`,
        html: `
          <p>Enter the 6-digit code below to verify your identity and complete the sign up</p>
          <h1>${code}</h1>
          <p>Thanks for helping us keep your account secure</p>
        `,
      });
      return 204;
    },

    login: async function (_, { email, password }) {
      // check for validation of email
      if (!validator.isEmail(email))
        throw new GraphQLError("Enter a valid email!");
      // check if user exists in DB
      const user = await User.findOne({ email });
      if (!user) throw new GraphQLError("Email does not exist!");
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new GraphQLError("Incorrect Password!");

      // sign a JWT token
      const token = createJWT(user);
      // return user along with token
      return { ...new UserDoc(user), token };
    },

    user: async function (_, args, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");
      const user = await User.findById(context.req.userId);
      console.log("returning userDoc");
      return new UserDoc(user);
    },

    products: async function () {
      const products = await Product.find({});
      console.log(products._doc);
      return products.map((p) => p._doc);
    },

    product: async function (_, { id, color }) {
      const product = await Product.findById(id);
      if (color) {
        product.colors = product.colors.filter(
          (item) => item.colorCode === color
        );
      }

      return product._doc;
    },

    cart: async function () {
      // TODO.  Later it will return cart items based on userId
      const userId = "65e21abd8130eef41e3bee8a";
      const cart = await Cart.findOne({ userId }).populate("items.product");

      if (!cart) throw new GraphQLError("No Items in Cart!");
      return cart._doc;
    },

    createPaymentIntent: async function (_, args, context) {
      // if (!context.req.isAuth) throw new GraphQLError("No User found!");
      const userId = "65e21abd8130eef41e3bee8a";
      const cart = await Cart.findOne({ userId });
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 434,
        currency: "usd",
      });
      return paymentIntent.client_secret;
    },
  },

  Mutation: {
    signup: async function (_, { user }) {
      const saltRounds = 12;
      const {
        email,
        firstName,
        lastName,
        dob,
        tos,
        emailSignUp,
        password,
        code,
      } = user;
      // check for email and password validation
      if (!validator.isEmail(email))
        throw new GraphQLError("Enter a valid email!");
      if (!validator.isLength(password, { min: 8 })) {
        throw new GraphQLError("Password doesn't match requirements");
      }
      // check for email existance in DB
      const userFound = await User.findOne({ email });
      if (userFound) throw new GraphQLError("User already exists!");
      // verify signupToken
      const codeVerified = await SignUpCode.findOne({
        email,
        code,
        expiry: { $gt: Date.now() },
      });
      if (!codeVerified) throw new GraphQLError("Incorrect Code!");
      // create new user obj
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const userObj = new User({
        email,
        password: hashedPassword,
        tos,
        dob,
        firstName,
        lastName,
        emailSignUp,
      });
      const savedUser = await userObj.save();
      // delete entry from SignupCode Collection
      await SignUpCode.deleteOne({ email });
      // sign a JWT token
      const token = createJWT(savedUser);
      // return user along with token
      return { ...new UserDoc(savedUser), token };
    },

    addToCart: async function (_, { id, colorCode, size, currentPrice }) {
      // get userId from jwt load that user from DB
      // use 65e21abd8130eef41e3bee8a for now
      const userId = "65e21abd8130eef41e3bee8a";
      let cart = await Cart.findOne({ userId });
      let existingProduct = null;
      if (!cart) {
        cart = new Cart({ userId });
      } else {
        existingProduct = cart.items?.find(
          (p) =>
            p.product?.toString() === id &&
            p.colorCode === colorCode &&
            p.size === size
        );
      }

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.items.push({
          product: id,
          colorCode,
          size,
          quantity: 1,
          currentPrice,
        });
      }
      await cart.save();
      return 201;
    },

    updateCartItem: async function (_, { id, data }, context) {
      const userId = "65e21abd8130eef41e3bee8a";
      const cart = await Cart.findOne({ userId });
      const cartItem = cart.items.id(id);
      cartItem.set({ ...cartItem._doc, ...data });

      await cart.save();
      return 200;
    },

    deleteCartItem: async function (_, { id }) {
      const userId = "65e21abd8130eef41e3bee8a";
      const cart = await Cart.findOne({ userId });
      cart.items.id(id).deleteOne();
      await cart.save();

      return 200;
    },

    updateAddress: async function (_, { data }, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const user = await User.findById(context.req.userId);
      user.shippingAddress = data;
      await user.save();
      return data;
    },
  },
};

export default graphqlResolvers;
