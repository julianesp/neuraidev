//models\ProductModel.js
import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const ProductModel =
  mongoose.models.Producto || mongoose.model("Producto", topicSchema);

export default ProductModel;
