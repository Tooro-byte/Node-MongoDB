const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1, // Changed from 0 to 1
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number, // ✅ Fixed: was "ytpe"
          required: true,
        },
        image: {
          // Added this field (used in your cart routes)
          type: String,
          required: true,
        },
      },
    ],
    totalProducts: {
      type: Number,
      default: 0, // ✅ Fixed: removed required, added default
    },
    totalCartPrice: {
      type: Number,
      default: 0, // ✅ Fixed: removed required, added default
    },
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt
  }
);

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart; // ✅ Fixed: was "mongoose.model.exports"
