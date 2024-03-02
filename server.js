import "dotenv/config";
// import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { createYoga, createSchema } from "graphql-yoga";

import graphqlSchema from "./graphql/schema.js";
import graphqlResolvers from "./graphql/resolvers.js";
import authMiddleware from "./middleware/auth.js";

const app = express();

// creating schema and yoga for graphql
const schema = createSchema({
  typeDefs: graphqlSchema,
  resolvers: graphqlResolvers,
});
const yoga = createYoga({ schema });

// to parse json from req.body
app.use(express.json());

// use cors or middleware below that
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(authMiddleware);
//graphql yoga middleware to handle request i.e POST
app.use("/graphql", yoga);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected!");
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
