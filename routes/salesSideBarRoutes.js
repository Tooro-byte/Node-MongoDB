const express = require("express");
const router = express.Router();
const user = require("../models/users");

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

module.exports = router;
