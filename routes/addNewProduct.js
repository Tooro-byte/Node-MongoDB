const express = require("express");
const router = express.Router();
const multer = require("multer");
const category = require("../models/categoryModel");
const proucts = require("../models/productsSchema");
const { ensureAdmin } = require("../AuthMiddleWare/checkRole");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/products");
  },
  filename: (req, file, cb) => {
    const timeStamp = Date.now();
    const orignalName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9 .-]/g, "");
    cb(null, `${timeStamp}-${originalName}`);
  },
});
const fileFilter = (req, res, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid File Type!, Try Again Later."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// <<<< A post Route To add New Products to the WebPage <<<<<<<
router.post("/add-product", upload.array('images', 8), async (req, res) => {
  const { title, description, category, price, stockId } = req.body;
  const images = req.file.map((image) => image.filename);
  if (images.length === 0) {
    return res.status(400).json({ message: "At least one Image is Required" });
  }
  const newProduct = new productsSchema({
    title,
    description,
    category,
    price,
    stockId,
    images,
    seller: req.user._id,
  });
  await newProduct.save();
  res.status(201).json(newProduct);
});

module.exports = router;
