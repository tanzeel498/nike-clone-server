const graphqlSchema = `

  type Address {
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    address: String!
    apt: String
    city: String!
    state: String!
    postalCode: Int!
  }

  type UserDoc {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    dob: String!
    shippingAddress: Address
    token: String!
  }

  type ProductSku {
    _id: ID!
    size: String!
    localizedSize: String!
    available: Boolean!
  }

  type ProductImage {
    src: String!
    alt: String!
    srcThumbnail: String!
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

  type ProductsData {
    products: [Product]!
    numProducts: Int!
  }

  type CartItem {
    _id: ID!
    product: Product!
    colorCode: String!
    size: String!
    quantity: Int!
    currentPrice: Float!
  }

  type OrderItem {
    productId: ID!
    colorCode: String!
    size: String!
    quantity: Int!
    price: Float!
    title: String!
    subtitle: String!
  }

  type Order {
    _id: ID!
    items: [OrderItem!]
    address: Address!
    paymentId: String!
    totalAmount: Float!
    status: String!
    createdAt: String!
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

  input UserUpdateData {
    firstName: String
    lastName: String
    dob: String
    oldPassword: String
    newPassword: String
  }

  input CartItemUpdateData {
    size: String
    quantity: Int
  }

  input AddressInputData {
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    address: String!
    apt: String
    city: String!
    state: String!
    postalCode: Int!
  }

  input ProductFilter {
    category: String
    gender: String
    size: String
    price: String
    color: String
    q: String
  }

  type Query {
    join(email: String!): Int!
    login(email: String!, password: String!): UserDoc!
    user: UserDoc!
    products(sortBy: String!, filter: ProductFilter): ProductsData!
    searchProducts(q: String!) : [Product!]
    product(id: ID!, color: String): Product!
    cart: CartDoc!
    order(id: ID!): Order!
    orders: [Order!]
  }

  type Mutation {
    signup(user: UserData): UserDoc!
    forgotPassword(email: String!): Int!
    resetPassword(email: String!, code: Int!, newPassword: String!): Int!
    updateUser(data: UserUpdateData!) : UserDoc!
    addToCart(id: ID!, colorCode: String!, size: String!, currentPrice: Float!): Int!
    updateCartItem(id: ID!, data: CartItemUpdateData!): Int!
    deleteCartItem(id: ID!): Int!
    updateAddress(data: AddressInputData!): Address!
    createPaymentIntent: String!
    createOrder(paymentIntent: String!): Int!
    createProducts: Int!
  }

`;

export default graphqlSchema;
