const express = require("express");
const Product = require("../models/productsSchema");
const Cart = require("../models/cartModel");
const { ensureAuthenticated } = require("../AuthMiddleWare/checkRole");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(ensureAuthenticated);

// API to Get Cart Item Count
router.get("/count", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const totalProducts = cart ? cart.totalProducts : 0;
    res.status(200).json({ totalProducts });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    res.status(500).json({ Message: "Server Error", error: error.message });
  }
});

// API to Add Product to Cart
router.post("/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    // Check if user does not provide productId or quantity is not a valid number
    if (!productId || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({
        Message: "Product ID and a valid quantity (minimum 1) are required",
      });
    }

    // Check if the product exists in the Database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ Message: "Product Not Found" });
    }

    if (product.stockId < quantity) {
      return res.status(400).json({ Message: "Sorry! Insufficient Stock" });
    }

    // Find the User's Cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [],
        totalProducts: 0,
        totalCartPrice: 0,
      });
    }

    // Check if product exists in the cart
    const existingProductIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingProductIndex !== -1) {
      if (
        cart.products[existingProductIndex].quantity + quantity >
        product.stockId
      ) {
        return res.status(400).json({ Message: "Sorry, Insufficient Stock" });
      }
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({
        productId: productId,
        quantity: quantity,
        title: product.title,
        price: product.price,
        image: product.images[0],
      });
    }

    // Update totals
    cart.totalProducts = cart.products.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    cart.totalCartPrice = cart.products.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();

    // Return JSON response for AJAX requests
    res.status(200).json({
      Message: "Product added to cart successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Error in add to cart:", error);
    res.status(500).json({ Message: "Server Error", error: error.message });
  }
});

// API to Display Cart (Render Pug Template)
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    // Get user information
    const user = {
      name: req.user.name,
      email: req.user.email,
      photo: req.user.photo || "/images/default-avatar.png",
    };

    if (!cart || cart.products.length === 0) {
      return res.render("cart", {
        cart: { products: [], totalProducts: 0, totalCartPrice: 0 },
        user: user,
      });
    }

    res.render("cart", { cart: cart, user: user });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ Message: "Server Error", error: error.message });
  }
});

// API to Increase Product Quantity
router.patch("/increase/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // Check if Product Exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ Message: "Product Not Found" });
    }

    // Find the current user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ Message: "Cannot Find Cart" });
    }

    // Find the product in the products array
    const index = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ Message: "Product Not Found in Cart" });
    }

    if (cart.products[index].quantity >= product.stockId) {
      return res.status(400).json({ Message: "Product out of Stock" });
    }

    // Increase the product Quantity
    cart.products[index].quantity++;

    // Update totalProducts and Total Cart Price
    cart.totalProducts++;
    cart.totalCartPrice += cart.products[index].price;

    // Save the Updated Cart
    await cart.save();

    res.json({
      Message: "Product Quantity Increased Successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Error increasing quantity:", error);
    res.status(500).json({ Message: "Server Error", error: error.message });
  }
});

// API to Decrease Product Quantity
router.patch("/decrease/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the current user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ Message: "Cannot Find Cart" });
    }

    // Find the product in the products array
    const index = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ Message: "Product Not Found in Cart" });
    }

    // Decrease the product Quantity
    if (cart.products[index].quantity > 1) {
      cart.products[index].quantity--;
      cart.totalProducts--;
      cart.totalCartPrice -= cart.products[index].price;
    } else {
      // If quantity is 1, remove the product from cart
      cart.totalProducts -= 1;
      cart.totalCartPrice -= cart.products[index].price;
      cart.products.splice(index, 1);
    }

    // Save the Updated Cart
    await cart.save();

    res.json({
      Message: "Product Quantity Decreased Successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Error decreasing quantity:", error);
    res.status(500).json({ Message: "Server Error", error: error.message });
  }
});

// API to Delete a Product from Cart
router.delete("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the current user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ Message: "Cannot Find Cart" });
    }

    // Find the product in the products array
    const index = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ Message: "Product Not Found in Cart" });
    }

    // Update totals before removing
    const removedProduct = cart.products[index];
    cart.totalProducts -= removedProduct.quantity;
    cart.totalCartPrice -= removedProduct.price * removedProduct.quantity;

    // Remove the product from cart
    cart.products.splice(index, 1);

    // Save the Updated Cart
    await cart.save();

    res.json({ Message: "Product Removed from Cart Successfully", cart: cart });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ Message: "Server Error", error: error.message });
  }
});

// API to Clear Entire Cart
router.delete("/clear/all", async (req, res) => {
  try {
    // Find the current user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ Message: "Cannot Find Cart" });
    }

    // Clear all products
    cart.products = [];
    cart.totalProducts = 0;
    cart.totalCartPrice = 0;

    // Save the Updated Cart
    await cart.save();

    res.json({ Message: "Cart Cleared Successfully", cart: cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ Message: "Server Error", error: error.message });
  }
});

module.exports = router;
