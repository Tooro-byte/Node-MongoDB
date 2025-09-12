const express = require("express");
const router = express.Router();
const user = require("../models/users");

router.get("/client-page", async (req, res) => {
  res.render("client-dashboard");
});

router.post("/client-page", async (params) => {});

module.exports = router;
