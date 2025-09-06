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
  phone: Joi.number().optional().allow(null, ""),
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
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      phone: phone || null,
      role,
      mailingAddress: role === "client" ? mailingAddress : "",
      newsletter: newsletter || false,
    });

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
        ? "/admin/dashboard"
        : newUser.role === "salesAgent"
        ? "/salesAgent/dashboard"
        : "/client/dashboard";

    res.status(201).json({
      token,
      redirectUrl,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Email signup error:", error.message, error.stack);

    // Handle specific mongoose errors
    if (error.name === "UserExistsError") {
      return res.status(400).json({ message: "User already exists" });
    }

    res.status(500).json({ message: "Server error during signup" });
  }
});

// Render login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Add dashboard routes
router.get("/client/dashboard", (req, res) => {
  console.log("Client dashboard accessed");
  res.send(`
    <h1>Client Dashboard</h1>
    <p>Welcome to your client dashboard!</p>
    <a href="/logout">Logout</a>
  `);
});

router.get("/admin/dashboard", (req, res) => {
  console.log("Admin dashboard accessed");
  res.send(`
    <h1>Admin Dashboard</h1>
    <p>Welcome to the admin dashboard!</p>
    <a href="/logout">Logout</a>
  `);
});

router.get("/salesAgent/dashboard", (req, res) => {
  console.log("Sales Agent dashboard accessed");
  res.send(`
    <h1>Sales Agent Dashboard</h1>
    <p>Welcome to the sales agent dashboard!</p>
    <a href="/logout">Logout</a>
  `);
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

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, name: user.name, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    // Determine redirect URL
    const redirectUrl =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "salesAgent"
        ? "/salesAgent/dashboard"
        : "/client/dashboard";

    console.log("Login successful for:", email);
    res.status(200).json({
      token,
      redirectUrl,
      message: "Login successful",
    });
  })(req, res);
});

module.exports = router;
