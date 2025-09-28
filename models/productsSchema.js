const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    maxlength: 100,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default: null, // Made optional
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stockId: {
    type: Number,
    required: true,
    min: 0,
  },
  images: {
    type: [String],
    required: true,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 0,
      },
      comment: {
        type: String,
        maxlength: 250,
      },
    },
  ],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
