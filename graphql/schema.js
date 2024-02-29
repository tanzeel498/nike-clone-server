const graphqlSchema = `
  type Query {
    hello: String!
  }

  type Mutation {
    join(email: String!) : Int!
  }
`;

export default graphqlSchema;
