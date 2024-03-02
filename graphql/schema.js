const graphqlSchema = `
  type UserDoc {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    token: String
  }

  type ProductSku {
    _id: ID!
    size: Float!
    available: Boolean!
  }

  type ProductImage {
    src: String!
    alt: String!
  }

  type ProductColor {
    colorDescription: String!
    fullPrice: Float!
    currentPrice: Float!
    portraitUrl: String!
    squarishUrl: String!
    colorCode: String!
    images: [ProductImage!]!
    skus: [ProductSku!]!
  }

  type Product {
    _id: ID!
    title: String!
    subtitle: String!
    description: String!
    descriptionPreview: String!
    gender: [String!]!
    styleCode: String!
    colors: [ProductColor!]!
    sizeChartUrl: String!
  }

  type CartItem {
    _id: ID!
    product: Product!
    colorCode: String!
    size: Float!
    quantity: Int!
    currentPrice: Float!
  }

  type CartDoc {
    userId: ID!
    items: [CartItem!]!
  }

  input UserData {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    dob: String!
    tos: Boolean!
    emailSignUp: Boolean!
    code: Int!
  }

  input CartItemUpdateData {
    size: Float
    quantity: Int
  }

  type Query {
    join(email: String!): Int!
    login(email: String!, password: String!) : UserDoc!
    user: UserDoc!
    products: [Product!]!
    product(id: ID!, color: String): Product!
    cart: CartDoc!
  }

  type Mutation {
    signup(user: UserData) : UserDoc!
    addToCart(id: ID!, colorCode: String!, size: Float!, currentPrice: Float!): Int!
    updateCartItem(id: ID!, data: CartItemUpdateData!): Int!
    deleteCartItem(id: ID!): Int!
  }

`;

export default graphqlSchema;
