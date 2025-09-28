const express = require("express");
const router = express.Router();
const multer = require("multer");
const Category = require("../models/categoryModel");
const Product = require("../models/productsSchema");
const User = require("../models/users");
const {
  ensureAuthenticated,
  ensureAdmin,
} = require("../AuthMiddleWare/checkRole");

console.log("Admin.js router loaded");

// Multer configuration for products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/products");
  },
  filename: (req, file, cb) => {
    const timeStamp = Date.now();
    const originalName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    cb(null, `${timeStamp}-${originalName}`);
  },
});

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/category");
  },
  filename: (req, file, cb) => {
    const timeStamp = Date.now();
    const originalName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    cb(null, `${timeStamp}-${originalName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, or GIF allowed."), false);
  }
};

const productUpload = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Admin dashboard route
router.get(
  "/admin-page",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    try {
      const products = await Product.find()
        .populate("category")
        .sort({ createdAt: -1 });
      const categories = await Category.find().sort({ name: 1 });
      res.render("admin-dashboard", {
        title: "Admin Dashboard - Kings Collections",
        products,
        categories,
        user: req.user,
      });
    } catch (error) {
      console.error("Error loading admin dashboard:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Product form route
router.get(
  "/add-product/new",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    console.log("GET /add-product/new accessed for user:", req.user);
    try {
      const categories = await Category.find().sort({ name: 1 });
      console.log("Categories found:", categories);
      res.render("productsForm", {
        title: "Add New Product - Kings Collections",
        categories,
        user: req.user,
      });
    } catch (error) {
      console.error("Error loading product form:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Category form route
router.get(
  "/categories/new",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    try {
      res.render("categoryForm", {
        title: "Add New Category - Kings Collections",
        user: req.user,
      });
    } catch (error) {
      console.error("Error loading category form:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update product form route
router.get(
  "/products/edit/:id",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    console.log("GET /products/edit/:id accessed");
    try {
      const product = await Product.findById(req.params.id).populate(
        "category"
      );
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const categories = await Category.find().sort({ name: 1 });
      res.render("updateProductForm", {
        title: "Update Product - Kings Collections",
        product,
        categories,
        user: req.user,
      });
    } catch (error) {
      console.error("Error loading update product form:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Create product
router.post(
  "/add-product",
  ensureAuthenticated,
  ensureAdmin,
  productUpload.array("images", 8),
  async (req, res) => {
    console.log("POST /add-product accessed");
    try {
      const { title, description, category, price, stockId } = req.body;
      const images = req.files.map((file) => file.filename);

      if (images.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one image is required" });
      }

      const newProduct = new Product({
        title,
        description,
        category,
        price: parseFloat(price),
        stockId: parseInt(stockId),
        images,
        seller: req.user ? req.user._id : null, // Fallback to null if not authenticated
      });

      await newProduct.save();
      await newProduct.populate("category");

      req.app.locals.io.emit("product-added", newProduct);

      res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Create category
router.post(
  "/categories",
  ensureAuthenticated,
  ensureAdmin,
  categoryUpload.single("image"),
  async (req, res) => {
    console.log("POST /categories accessed");
    try {
      const { name } = req.body;

      if (!name || !req.file) {
        return res.status(400).json({ message: "Name and image are required" });
      }

      // Check for existing category
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: `Category "${name}" already exists` });
      }

      const newCategory = new Category({
        name,
        image: req.file.filename,
      });

      await newCategory.save();

      req.app.locals.io.emit("category-added", newCategory);

      res.status(201).json({ success: true, category: newCategory });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Update product
router.put(
  "/products/:id",
  ensureAuthenticated,
  ensureAdmin,
  productUpload.array("images", 8),
  async (req, res) => {
    console.log("PUT /products/:id accessed");
    try {
      const { title, description, category, price, stockId } = req.body;
      const updateData = {
        title,
        description,
        category,
        price: parseFloat(price),
        stockId: parseInt(stockId),
      };

      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map((file) => file.filename);
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate("category");

      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      req.app.locals.io.emit("product-updated", updatedProduct);

      res.json({ success: true, product: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete product
router.delete(
  "/products/:id",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    console.log("DELETE /products/:id accessed");
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      req.app.locals.io.emit("product-deleted", { id: req.params.id });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
