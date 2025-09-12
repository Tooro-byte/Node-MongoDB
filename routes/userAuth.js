const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/users");

// Validate JWT_KEY
if (!process.env.JWT_KEY) {
  throw new Error("JWT_KEY environment variable is not set");
}

// Joi schema for email signup
const emailSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(null, ""),
  role: Joi.string().valid("client", "admin", "salesAgent").required(),
  mailingAddress: Joi.string().when("role", {
    is: "client",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("", null),
  }),
  password: Joi.string()
    .min(8)
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "number")
    .pattern(/[^A-Za-z0-9]/, "special character")
    .required()
    .messages({
      "string.pattern.name": "Password must contain at least one {#name}",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
  terms: Joi.string().valid("agreed").required().messages({
    "any.only": "You must agree to the terms",
  }),
  newsletter: Joi.boolean().optional(),
});

// Joi schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Render signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// Render auth success page
router.get("/auth-success", (req, res) => {
  const { token, redirectUrl, provider } = req.query;

  if (!token || !redirectUrl) {
    return res.redirect("/signup?error=invalid_auth_params");
  }

  const providerName = provider === "google" ? "Google" : "Facebook";

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Success</title>
      <meta http-equiv="Content-Security-Policy" content="script-src 'self' http://localhost:3005; style-src 'self' 'unsafe-inline';">
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: rgba(252, 4, 210, 1);
        }
        .container {
          text-align: center;
          background: teal;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px #0841fd79;
        }
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid rgba(4, 248, 167, 1);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loading"></div>
        <h2>${providerName} Authentication Successful!</h2>
        <p>Redirecting to your dashboard...</p>
      </div>
      <script src="/auth-success.js"></script>
    </body>
    </html>
  `);
});

// Email signup endpoint
router.post("/signup/email", async (req, res) => {
  const { error } = emailSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    console.error("Validation error in /signup/email:", errorMessages);
    return res.status(400).json({ message: errorMessages.join("; ") });
  }

  const { name, email, phone, role, mailingAddress, password, newsletter } =
    req.body;

  try {
    // Check if user already exists by email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("User already exists:", email);
      return res
        .status(400)
        .json({ message: "A user with this email is already registered" });
    }

    // Create new user data object - only include fields that have values
    const newUserData = {
      name,
      email: email.toLowerCase(),
      role,
      newsletter: !!newsletter,
      lastLogin: new Date(), // Set initial login date
    };

    // Only add phone if it has a value
    if (phone && phone.trim() !== "") {
      newUserData.phone = phone;
    }

    // Only add mailingAddress if role is client and it has a value
    if (role === "client" && mailingAddress && mailingAddress.trim() !== "") {
      newUserData.mailingAddress = mailingAddress;
    }

    // Don't set googleId or facebookId at all for email signups
    // This ensures they are completely omitted from the document

    const newUser = new User(newUserData);

    // Register user with password
    await User.register(newUser, password);
    console.log("User registered successfully:", email);

    // Generate JWT token
    const token = jwt.sign(
      { _id: newUser._id, name: newUser.name, role: newUser.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    // Determine redirect URL
    const redirectUrl =
      newUser.role === "admin"
        ? "/admin-page"
        : newUser.role === "salesAgent"
        ? "/sales-agent-page"
        : "/client-page";

    res.status(201).json({
      token,
      redirectUrl,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Email signup error:", error.message, error.stack);
    console.error(
      "Duplicate key error details:",
      error.keyPattern,
      error.keyValue
    );

    // Handle specific errors
    if (error.name === "UserExistsError") {
      return res
        .status(400)
        .json({ message: "A user with this email is already registered" });
    }
    if (error.code === 11000) {
      if (error.keyPattern?.googleId) {
        return res.status(500).json({
          message:
            "Server error: Issue with user registration. Please contact support.",
        });
      }
      if (error.keyPattern?.facebookId) {
        return res.status(500).json({
          message:
            "Server error: Issue with user registration. Please contact support.",
        });
      }
      if (error.keyPattern?.email) {
        return res.status(400).json({
          message: "A user with this email is already registered",
        });
      }
      return res.status(400).json({
        message: "A user with similar information already exists",
      });
    }

    res.status(500).json({ message: "Server error during signup" });
  }
});

// Render login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    console.error("Validation error in /login:", error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Server error during login" });
    }

    if (!user) {
      console.log("Invalid login attempt:", email);
      return res.status(401).json({
        message: info?.message || "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user
      .save()
      .catch((err) => console.error("Error updating last login:", err));

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, name: user.name, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    // Determine redirect URL
    const redirectUrl =
      user.role === "admin"
        ? "/admin-page"
        : user.role === "salesAgent"
        ? "/sales-agent-page"
        : "/client-page";

    console.log("Login successful for:", email);
    res.status(200).json({
      token,
      redirectUrl,
      message: "Login successful",
    });
  })(req, res);
});

//>>>>>>>>>>logout button>>>>>>>>>>>

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).send("Error Logging out!");
      }
      res.send("Thank You for Visting Kings Collections");
    });
  }
});
module.exports = router;
