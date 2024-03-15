import { Schema, model } from "mongoose";

const skuSchema = new Schema({
  size: String,
  localizedSize: String,
  available: Boolean,
});

const imageSchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    srcThumbnail: { type: String, required: true },
  },
  { _id: false }
);

const colorSchema = new Schema({
  colorCode: { type: String, required: true },
  colorDescription: { type: String, required: true },
  fullPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  portraitUrl: { type: String, required: true },
  squarishUrl: { type: String, required: true },
  images: [imageSchema],
  skus: [skuSchema],
});

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    descriptionPreview: { type: String, required: true },
    gender: [{ type: String, required: true }],
    styleCode: { type: String, required: true },
    category: [{ type: String, required: true }],
    colors: [colorSchema],
    sizeChartUrl: String,
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
export default Product;
