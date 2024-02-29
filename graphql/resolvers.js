import validator from "validator";
import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

class UserDoc {
  constructor(user) {
    this._id = user._id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}

const graphqlResolvers = {
  Query: {
    join: async function (_, { email }, context) {
      // check for validation of email
      if (!validator.isEmail(email))
        throw new GraphQLError("Enter a valid email!");

      // check if user exists in DB
      const user = await User.findOne({ email });

      if (!user) return 204;
      return 200;
    },

    login: async function (_, { email, password }, context) {
      // check for validation of email
      if (!validator.isEmail(email)) {
        throw new GraphQLError("Enter a valid email!");
      }
      // check if user exists in DB
      const user = await User.findOne({ email });
      if (!user) throw new GraphQLError("Email does not exist!");
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new GraphQLError("Incorrect Password!");

      // sign a JWT token
      const token = jwt.sign(
        { userId: user._id, email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "5 days" }
      );
      // return user along with token
      return { ...new UserDoc(user), token };
    },
  },
};

export default graphqlResolvers;
