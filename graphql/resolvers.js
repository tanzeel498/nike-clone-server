import validator from "validator";
import { GraphQLError } from "graphql";

import User from "../models/user.js";

const graphqlResolvers = {
  Query: {
    hello: () => "Hello World",
  },

  Mutation: {
    join: async function (_, { email }, context) {
      console.log(email);
      // check for validation of email
      if (!validator.isEmail(email)) {
        throw new GraphQLError("Enter a valid email!");
      }

      // check if user exists in DB
      const user = await User.findOne({ email });
      if (!user) return 204;
      return 200;
    },
  },
};

export default graphqlResolvers;
