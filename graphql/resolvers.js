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

function createJWT(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "5 days",
    }
  );
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
  },

  Mutation: {
    signup: async function (_, { user }, context) {
      const saltRounds = 12;
      const { email, firstName, lastName, dob, tos, emailSignUp, password } =
        user;
      // check for email and password validation
      if (!validator.isEmail(email))
        throw new GraphQLError("Enter a valid email!");
      if (!validator.isLength(password, { min: 8 })) {
        throw new GraphQLError("Password doesn't match requirements");
      }
      // check for email existance in DB
      const userFound = await User.findOne({ email });
      if (userFound) throw new GraphQLError("User already exists!");

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
      // sign a JWT token
      const token = createJWT(savedUser);
      // return user along with token
      return { ...new UserDoc(savedUser), token };
    },
  },
};

export default graphqlResolvers;
