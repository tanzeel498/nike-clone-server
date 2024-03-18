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
import Order from "../models/order.js";
// import productsDB from "../data/script.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SALT_ROUNDS = 12;

const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: { user: "tanzeel498@gmail.com", pass: process.env.BREVO_SMTP_KEY },
});

// TODO.. fix cart to get currentPrice from product

class UserDoc {
  constructor(user) {
    this._id = user._id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.dob = user.dob;
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

function addCurrentPriceToCartItems(cart) {
  cart.items?.forEach((item) => {
    item.product.colors?.forEach((c) => {
      if (c.colorCode === item.colorCode) item.currentPrice = c.currentPrice;
    });
  });
}

async function generateCode(email) {
  await SignUpCode.deleteOne({ email });
  const code = Math.round(Math.random() * 10000000);
  const codeObj = new SignUpCode({
    email,
    code,
    expiry: Date.now() + 10 * 60 * 1000,
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
          <p>Enter this code to verify your identity and complete the sign up</p>
          <h1>${code}</h1>
          <p>This code is valid for next 10 minutes</p>
          <p>Thanks for helping us keep your account secure</p>
        `,
      });
      return 201;
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
      return new UserDoc(user);
    },

    products: async function (_, { sortBy, filter }) {
      const { category, gender, size, price, color, q } = filter;
      let sortQuery;
      let countDocumentsQuery = {};
      let filterQuery = Object.keys(filter).length ? { $and: [] } : {};
      // switch for sortBy
      switch (sortBy) {
        case "newest":
          sortQuery = { createdAt: -1 };
          break;
        case "price-desc":
          sortQuery = { "colors.0.currentPrice": -1 };
          break;
        case "price-asc":
          sortQuery = { "colors.0.currentPrice": 1 };
          break;
        default:
          sortQuery = {};
      }
      // search query condition
      if (q) {
        filterQuery.$and.push({
          $or: [
            { title: { $regex: q, $options: "i" } },
            { subtitle: { $regex: q, $options: "i" } },
          ],
        });
      }
      // filter condition for categories
      if (category) {
        filterQuery.$and.push({
          $or: category.split("+").map((cat) => ({
            $or: [
              { category: cat },
              { title: { $regex: cat, $options: "i" } }, // case insensitive
              { subtitle: { $regex: cat, $options: "i" } },
              { descriptionPreview: { $regex: cat, $options: "i" } },
            ],
          })),
        });
      }

      if (size) {
        filterQuery.$and.push({
          "colors.skus": {
            $elemMatch: {
              size: { $in: size.split("+") },
              available: true,
            },
          },
        });
      }

      if (gender) {
        const genderArr = gender.split("+");
        if (genderArr.includes("unisex")) {
          const index = genderArr.indexOf("unisex");
          genderArr.splice(index, 1);
          if (!genderArr.includes("MEN")) genderArr.push("MEN");
          if (!genderArr.includes("WOMEN")) genderArr.push("WOMEN");
        }
        filterQuery.$and.push({ gender: { $in: genderArr } });
        countDocumentsQuery.gender = { $in: genderArr };
      }

      if (color) {
        filterQuery.$and.push({
          "colors.colorDescription": {
            $in: color.split("+").map((c) => new RegExp(c, "i")),
          },
        });
      }

      if (price) {
        const priceQueries = price.split("+").map((range) => {
          const [min, max] = range.split("-").map(parseFloat);
          return { "colors.0.currentPrice": { $gte: min, $lte: max } };
        });
        filterQuery.$and.push({ $or: priceQueries });
      }

      const products = await Product.find(filterQuery).sort(sortQuery);

      if (category?.includes("EQUIPMENT"))
        countDocumentsQuery = { category: "EQUIPMENT" };
      const numProducts = await Product.countDocuments(countDocumentsQuery);

      return { products: products.map((p) => p._doc), numProducts };
    },

    searchProducts: async function (_, { q }) {
      const products = await Product.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { subtitle: { $regex: q, $options: "i" } },
        ],
      }).limit(4);

      if (!products.length) throw new GraphQLError("No products Found!");
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

    cart: async function (_, args, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const cart = await Cart.findOne({ userId: context.req.userId }).populate({
        path: "items.product",
        select: "colors.colorCode colors.currentPrice",
      });

      if (!cart || !cart.items) throw new GraphQLError("No Items in Cart!");
      // add currentPrice to each cartItem
      addCurrentPriceToCartItems(cart);
      return cart._doc;
    },

    order: async function (_, { id }, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const order = await Order.findById(id);
      if (order.userId.toString() !== context.req.userId)
        throw new GraphQLError("Not Authorized!");

      return { ...order._doc, createdAt: order.createdAt.toDateString() };
    },

    orders: async function (_, _args, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const orders = await Order.find({ userId: context.req.userId }).sort({
        createdAt: -1,
      });

      return orders.map((o) => ({
        ...o._doc,
        createdAt: o.createdAt.toDateString(),
      }));
    },
  },

  Mutation: {
    signup: async function (_, { user }) {
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
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
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

    forgotPassword: async function (_, { email }) {
      if (!validator.isEmail(email))
        throw new GraphQLError("Enter a valid email!");

      const user = await User.findOne({ email });
      if (!user) throw new GraphQLError("Email does not exist!");

      // generate code and send to email
      const code = await generateCode(email);
      await transporter.sendMail({
        from: "'Nike Clone' <nikeclone@noreply.com>",
        to: email,
        subject: `Here's your Password Reset code ${code}`,
        html: `
          <p>Enter this code to reset your Password</p>
          <h1>${code}</h1>
          <p>This code is valid for next 10 minutes</p>
          <p>Thanks for helping us keep your account secure</p>
        `,
      });
      return 201;
    },

    resetPassword: async function (_, { email, code, newPassword }) {
      // check for email and password validation
      if (!validator.isEmail(email))
        throw new GraphQLError("Enter a valid email!");
      if (!validator.isLength(newPassword, { min: 8 })) {
        throw new GraphQLError("Password doesn't match requirements");
      }
      // check for email existance in DB
      const user = await User.findOne({ email });
      if (!user) throw new GraphQLError("User does not Exist!");
      // verify signupToken
      const codeVerified = await SignUpCode.findOne({
        email,
        code,
        expiry: { $gt: Date.now() },
      });
      if (!codeVerified) throw new GraphQLError("Incorrect Code!");
      // create hashedPassword
      user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await user.save();
      return 200;
    },

    updateUser: async function (_, { data }, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");
      const user = await User.findById(context.req.userId);
      const { oldPassword, newPassword, ...updateData } = data;
      // check if data contains update password data
      if (oldPassword) {
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) throw new GraphQLError("Old Password is Incorrect!");
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.password = hashedPassword;
      }
      for (const key in updateData) {
        user[key] = updateData[key];
      }
      const updatedUser = await user.save();
      return new UserDoc(updatedUser);
    },

    addToCart: async function (
      _,
      { id, colorCode, size, currentPrice },
      context
    ) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      let cart = await Cart.findOne({ userId: context.req.userId });
      let existingProduct = null;
      if (!cart) {
        cart = new Cart({ userId: context.req.userId });
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
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const cart = await Cart.findOne({ userId: context.req.userId });
      const cartItem = cart.items.id(id);
      cartItem.set({ ...cartItem._doc, ...data });

      await cart.save();
      return 200;
    },

    deleteCartItem: async function (_, { id }, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const cart = await Cart.findOne({ userId: context.req.userId });
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

    createPaymentIntent: async function (_, args, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const cart = await Cart.findOne({ userId: context.req.userId }).populate({
        path: "items.product",
        select: "colors.colorCode colors.currentPrice",
      });
      addCurrentPriceToCartItems(cart);
      // calculate cart total
      const cartTotal = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.currentPrice * 100,
        0
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: cartTotal,
        currency: "usd",
      });
      return paymentIntent.client_secret;
    },

    createOrder: async function (_, { paymentIntent }, context) {
      if (!context.req.isAuth) throw new GraphQLError("No User found!");

      const {
        status,
        amount_received,
        id: paymentId,
      } = await stripe.paymentIntents.retrieve(paymentIntent);

      if (status !== "succeeded")
        throw new GraphQLError("Your Payment was not successfull!");

      // check if order with same paymentId already exists
      const orderExists = await Order.findOne({ paymentId });
      if (orderExists) throw new GraphQLError("Order already created!");

      // create order based on the cart
      const cart = await Cart.findOne({ userId: context.req.userId }).populate({
        path: "items.product",
        select: "title subtitle colors.currentPrice colors.colorCode",
      });
      addCurrentPriceToCartItems(cart);

      // check if amount_received matches cartTotal
      const cartTotal = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.currentPrice * 100,
        0
      );

      if (cartTotal !== amount_received)
        throw new GraphQLError(
          "Amount received does not matches with Cart Amount!"
        );

      const orderItems = cart.items.map((item) => {
        const { product, currentPrice: price, ...data } = item;
        const { title, subtitle } = product;
        return { ...data, price, title, subtitle, productId: product._id };
      });

      const user = await User.findById(context.req.userId);
      const order = new Order({
        userId: context.req.userId,
        address: user.shippingAddress,
        items: orderItems,
        paymentId,
        totalAmount: amount_received / 100,
        status: "Pending",
      });
      await order.save();
      cart.items = [];
      await cart.save();

      return 200;
    },

    createProducts: async function () {
      // const productDB = {};
      // const productExists = await Product.findOne({
      //   styleCode: productDB.styleCode,
      // });

      // if (productExists) throw new GraphQLError("Product already exists!");

      // const newDBProduct = new Product(productDB);
      // await newDBProduct.save();
      // uncomment below line to add all products at once
      // await Product.insertMany(productsDB);
      return 200;
    },
  },
};

export default graphqlResolvers;
