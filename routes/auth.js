const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/users");

// Initiate Google OAuth
router.get("/google", (req, res, next) => {
  console.log("Initiating Google authentication at /api/auth/google");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
});

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3005/signup?error=auth_failed",
  }),
  async (req, res) => {
    try {
      const user = req.user;

      console.log("=== GOOGLE CALLBACK SUCCESS ===");
      console.log("User object received:", {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        googleId: user.googleId,
      });

      if (!user) {
        console.error("No user data received from Google authentication");
        return res.redirect(
          "http://localhost:3005/signup?error=invalid_profile"
        );
      }

      // Verify user was actually saved to database
      const dbUser = await User.findById(user._id);
      if (!dbUser) {
        console.error("User not found in database after Google auth");
        return res.redirect(
          "http://localhost:3005/signup?error=database_error"
        );
      }

      console.log("User verified in database:", {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        googleId: dbUser.googleId,
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          _id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );

      // Determine redirect URL based on role
      const redirectUrl =
        dbUser.role === "admin"
          ? "/admin/dashboard"
          : dbUser.role === "salesAgent"
          ? "/salesAgent/dashboard"
          : "/client/dashboard";

      console.log("=== REDIRECTING USER ===", {
        token: token.substring(0, 20) + "...",
        role: dbUser.role,
        redirectUrl,
      });

      // Redirect to signup page with success parameters
      res.redirect(
        `http://localhost:3005/signup?token=${token}&role=${
          dbUser.role
        }&redirectUrl=${encodeURIComponent(redirectUrl)}&googleAuth=true`
      );
    } catch (error) {
      console.error(
        "=== GOOGLE CALLBACK ERROR ===",
        error.message,
        error.stack
      );
      res.redirect("http://localhost:3005/signup?error=server_error");
    }
  }
);

// Test route for debugging
router.get("/test-callback", (req, res) => {
  console.log("Test callback route reached at /api/auth/test-callback");
  res.json({
    message: "Test callback route is working",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
