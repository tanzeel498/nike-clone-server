const graphqlSchema = `
  type ReturnUser {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    token: String!
  }

  type Query {
    join(email: String!): Int!
    login(email: String!, password: String!): ReturnUser!
  }

`;

export default graphqlSchema;
