const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Cart = require("../models/cartModel");
const { ensureClient } = require("../AuthMiddleWare/checkRole");

router.get("/client-page", ensureClient, async (req, res) => {
  try {
    // Log req.user for debugging
    console.log("req.user:", req.user);

    // Ensure req.user is available
    if (!req.user) {
      console.error("No user found in req.user");
      return res.redirect("/login");
    }

    // Fetch cart and order count
    const cart = await Cart.findOne({ user: req.user._id }).lean();

    // Render template with data
    res.render("client-dashboard", {
      user: {
        name: req.user.name || "Guest",
        photo: req.user.photo || null,
        role: req.user.role || "client",
        email: req.user.email || "",
      },
      cart: cart || { totalProducts: 0, totalCartPrice: 0, products: [] },
    });
  } catch (error) {
    console.error("Error rendering client dashboard:", error);
    res.status(500).send("Server Error");
  }
});

// Optional: Implement or remove POST route
router.post("/client-page", ensureClient, async (req, res) => {
  try {
    // Add logic for POST requests if needed
    res.redirect("/client-page");
  } catch (error) {
    console.error("Error handling POST /client-page:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
