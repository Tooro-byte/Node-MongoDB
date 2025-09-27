const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/users");

// Initiate Google OAuth
router.get("/google", (req, res, next) => {
  console.log("Initiating Google authentication at /api/auth/google");
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next); // Removed session: false
});

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3005/signup?error=auth_failed",
  }), // Removed session: false
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

      // Determine redirect URL based on role
      const redirectUrl =
        dbUser.role === "admin"
          ? "http://localhost:3005/admin-page"
          : dbUser.role === "salesAgent"
          ? "http://localhost:3005/sales-agent-page"
          : "http://localhost:3005/client-page";

      console.log("=== REDIRECTING USER DIRECTLY TO DASHBOARD ===", {
        role: dbUser.role,
        redirectUrl,
      });

      res.redirect(redirectUrl); // Direct redirect to dashboard
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

// Facebook Login
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);

// Facebook OAuth callback
router.get(
  "/facebook/callback",
  (req, res, next) => {
    // Check for Facebook error in callback
    if (req.query.error) {
      console.error("Facebook OAuth Error:", req.query);
      return res.redirect(
        `http://localhost:3005/signup?error=facebook_auth_failed&message=${encodeURIComponent(
          req.query.error_description || "Facebook authentication failed"
        )}`
      );
    }
    next();
  },
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:3005/signup?error=facebook_auth_failed",
    failureMessage: true,
  }), // Removed session: false
  async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("http://localhost:3005/signup?error=no_user_data");
      }

      console.log("=== FACEBOOK CALLBACK SUCCESS ===");

      const redirectUrl =
        user.role === "admin"
          ? "http://localhost:3005/admin-page"
          : user.role === "salesAgent"
          ? "http://localhost:3005/sales-agent-page"
          : "http://localhost:3005/client-page";

      res.redirect(redirectUrl); // Direct redirect to dashboard
    } catch (error) {
      console.error("=== FACEBOOK CALLBACK ERROR ===");
      console.error("Error message:", error.message);
      res.redirect(
        `http://localhost:3005/signup?error=server_error&message=${encodeURIComponent(
          "Server error during Facebook authentication: " + error.message
        )}`
      );
    }
  }
);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const passport = require("passport");
// const User = require("../models/users");

// // Initiate Google OAuth
// router.get("/google", (req, res, next) => {
//   console.log("Initiating Google authentication at /api/auth/google");
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     session: false,
//   })(req, res, next);
// });

// // Google OAuth callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     session: false,
//     failureRedirect: "http://localhost:3005/signup?error=auth_failed",
//   }),
//   async (req, res) => {
//     try {
//       const user = req.user;

//       console.log("=== GOOGLE CALLBACK SUCCESS ===");
//       console.log("User object received:", {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         googleId: user.googleId,
//       });

//       if (!user) {
//         console.error("No user data received from Google authentication");
//         return res.redirect(
//           "http://localhost:3005/signup?error=invalid_profile"
//         );
//       }

//       // Verify user was actually saved to database
//       const dbUser = await User.findById(user._id);
//       if (!dbUser) {
//         console.error("User not found in database after Google auth");
//         return res.redirect(
//           "http://localhost:3005/signup?error=database_error"
//         );
//       }

//       console.log("User verified in database:", {
//         id: dbUser._id,
//         email: dbUser.email,
//         name: dbUser.name,
//         googleId: dbUser.googleId,
//       });

//       // Generate JWT token
//       const token = jwt.sign(
//         {
//           _id: dbUser._id,
//           name: dbUser.name,
//           email: dbUser.email,
//           role: dbUser.role,
//         },
//         process.env.JWT_KEY,
//         { expiresIn: "1h" }
//       );

//       //>>>>>>> Determine redirect URL based on role>>>>>>
//       const redirectUrl =
//         dbUser.role === "admin"
//           ? "http://localhost:3005/admin-page"
//           : dbUser.role === "salesAgent"
//           ? "http://localhost:3005/sales-agent-page"
//           : "http://localhost:3005/client-page";

//       console.log("=== REDIRECTING USER DIRECTLY TO DASHBOARD ===", {
//         token: token.substring(0, 20) + "...",
//         role: dbUser.role,
//         redirectUrl,
//       });

//       // Redirect to a dedicated auth success page with token as URL parameter
//       const authSuccessUrl = `http://localhost:3005/auth-success?token=${encodeURIComponent(
//         token
//       )}&redirectUrl=${encodeURIComponent(redirectUrl)}&provider=google`;
//       res.redirect(authSuccessUrl);
//     } catch (error) {
//       console.error(
//         "=== GOOGLE CALLBACK ERROR ===",
//         error.message,
//         error.stack
//       );
//       res.redirect("http://localhost:3005/signup?error=server_error");
//     }
//   }
// );

// // >>>>>>>>>>>> Implementing Facebook Login In the Application so far >>>>>>>>>>>>>

// router.get(
//   "/facebook",
//   passport.authenticate("facebook", {
//     scope: ["public_profile", "email"],
//   })
// );

// router.get(
//   "/facebook/callback",
//   (req, res, next) => {
//     // Check for Facebook error in callback
//     if (req.query.error) {
//       console.error("Facebook OAuth Error:", req.query);
//       return res.redirect(
//         `http://localhost:3005/signup?error=facebook_auth_failed&message=${encodeURIComponent(
//           req.query.error_description || "Facebook authentication failed"
//         )}`
//       );
//     }
//     next();
//   },
//   passport.authenticate("facebook", {
//     session: false,
//     failureRedirect: "http://localhost:3005/signup?error=facebook_auth_failed",
//     failureMessage: true,
//   }),
//   async (req, res) => {
//     try {
//       const user = req.user;
//       if (!user) {
//         return res.redirect("http://localhost:3005/signup?error=no_user_data");
//       }

//       console.log("=== FACEBOOK CALLBACK SUCCESS ===");

//       const token = jwt.sign(
//         { _id: user._id, name: user.name, email: user.email, role: user.role },
//         process.env.JWT_KEY,
//         { expiresIn: "1h" }
//       );

//       const redirectUrl =
//         user.role === "admin"
//           ? "http://localhost:3005/admin-page"
//           : user.role === "salesAgent"
//           ? "http://localhost:3005/sales-agent-page"
//           : "http://localhost:3005/client-page";

//       const authSuccessUrl = `http://localhost:3005/auth-success?token=${encodeURIComponent(
//         token
//       )}&redirectUrl=${encodeURIComponent(redirectUrl)}&provider=facebook`;
//       res.redirect(authSuccessUrl);
//     } catch (error) {
//       console.error("=== FACEBOOK CALLBACK ERROR ===");
//       console.error("Error message:", error.message);
//       res.redirect(
//         `http://localhost:3005/signup?error=server_error&message=${encodeURIComponent(
//           "Server error during Facebook authentication: " + error.message
//         )}`
//       );
//     }
//   }
// );
// module.exports = router;
