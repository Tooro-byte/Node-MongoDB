const express = require("express");
const router = express.Router();
const user = require("../models/users");

router.get("/sales-agent-page", async (req, res) => {
  res.render("sales-dashboard");
});

router.post("/sales-agent-page", async (params) => {});

module.exports = router;
