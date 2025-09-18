const express = require("express");
const router = express.Router();

// Splash page route
router.get("/", (req, res) => {
  // Render the splash page, allowing the client-side JS to handle the timer and redirect
  res.render("splash");
});

// Main application route
router.get("/index", (req, res) => {
  // Render the main index.pug file
  res.render("index");
});

module.exports = router;
