const express = require("express");
const router = express.Router();
const user = require("../models/users");
const { ensureSalesAgent } = require("../AuthMiddleWare/checkRole");

router.get("/sales-agent-page", ensureSalesAgent, async (req, res) => {
  res.render("sales-dashboard");
});

router.post("/sales-agent-page", ensureSalesAgent, async (params) => {});

module.exports = router;
