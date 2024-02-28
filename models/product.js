import { Schema, model } from "mongoose";

const skuSchema = new Schema({ size: Number, available: Boolean });

const colorSchema = new Schema(
  {
    colorCode: { type: String, required: true },
    colorDescription: { type: String, required: true },
    fullPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    portraitUrl: { type: String, required: true },
    squarishUrl: { type: String, required: true },
    images: [{ src: String, alt: String }],
    skus: [skuSchema],
  },
  { _id: false }
);

const productSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  descriptionPreview: { type: String, required: true },
  gender: [{ type: String, required: true }],
  styleCode: { type: String, required: true },
  category: [{ type: String, required: true }],
  colors: [colorSchema],
  sizeChartUrl: { type: String, required: true },
});

export default Product = model("Product", productSchema);
