const express = require("express");
const router = express.Router();
const user = require("../models/users");

router.get("/admin-page", async (req, res) => {
  res.render("admin-dashboard");
});

router.post("/admin-page", async (req, res) => {});

module.exports = router;
