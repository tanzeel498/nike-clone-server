const graphqlSchema = `
  type UserDoc {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    token: String!
  }

  input UserData {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    dob: String!
    tos: Boolean!
    emailSignUp: Boolean!
  }

  type Query {
    join(email: String!): Int!
    login(email: String!, password: String!) : UserDoc!
  }

  type Mutation {
    signup(user: UserData) : UserDoc!
  }

`;

export default graphqlSchema;
