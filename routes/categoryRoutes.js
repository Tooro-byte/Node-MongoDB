const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");
const multer = require("multer");

const storage = multer.diskStorage({
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

// Disabled: Use /categories in admin.js instead
router.post("/api/category", upload.single("icon"), async (req, res) => {
  res.status(404).json({ message: "Use /categories instead" });
});

router.get("/api/category", async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

module.exports = router;
