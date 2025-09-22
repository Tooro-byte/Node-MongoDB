const express = require("express");
const router = express.Router();
const user = require("../models/users");
const category = require("../models/categoryModel");
const proucts = require("../models/productsSchema");
const { ensureAdmin } = require("../AuthMiddleWare/checkRole");

router.get("/admin-page", ensureAdmin, async (req, res) => {
  res.render("admin-dashboard");
});

router.post("/admin-page", ensureAdmin, async (req, res) => {});

module.exports = router;
