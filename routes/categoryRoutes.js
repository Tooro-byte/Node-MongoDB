const express = require("express");
const router = express.Router();
const category = require("../models/categoryModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/category");
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
//>>>> Define Route for Adding New Category >>>>>
router.post("/api/category", upload.single("icon"), async (req, res) => {
  if (!req.body.name || !req.file) {
    return res.status(400).json({ message: "Name and Icon Are Required" });
  }
  const newCategory = new category({
    name: req.body.name,
    image: req.file.filename,
  });
  await newCategory.save();
  res
    .status(201)
    .json({ message: "Category Created Sucessfully", category: "newCategory" });
});

router.get("/api/category", async (req, res) => {
  const categories = await category.find().sort("name");
  res.json(categories);
});

module.exports = router;
