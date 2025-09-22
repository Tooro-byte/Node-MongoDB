const express = require("express");
const router = express.Router();
const user = require("../models/users");
const { ensureClient } = require("../AuthMiddleWare/checkRole");

router.get("/client-page", ensureClient, async (req, res) => {
  res.render("client-dashboard");
});

router.post("/client-page", async (params) => {});

module.exports = router;
