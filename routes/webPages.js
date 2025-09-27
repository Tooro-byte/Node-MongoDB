const express = require("express");
const router = express.Router();
const user = require("../models/users");
const Category = require("../models/categoryModel");
const Products = require("../models/productsSchema");

// Let me Handle Sales Agent Side bar APIs from here dii

// Order, New and Old
router.get("/orders", async (req, res) => {
  res.render("orders");
});

// Point od Sale Service API
router.get("/pos", async (req, res) => {
  res.render("pos");
});

// Customers API

router.get("/customers", async (req, res) => {
  res.render("customers");
});

//Inventory API

router.get("/inventory", async (req, res) => {
  res.render("inventory");
});

// <<<<<<<<<<  Displaying the Products <<<<<<<<<<<
router.get("/products", async (req, res) => {
  try {
    // Fetch both products and categories from the database
    const products = await Products.find({}).populate("category");
    const categories = await Category.find({});

    // Render the Pug template and pass the data
    res.render("storeProducts", {
      title: "Our Products",
      products: products, // This is the crucial line!
      categories: categories,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
