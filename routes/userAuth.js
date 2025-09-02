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

// Joi schema for validation
const joySchema = Joi.object({
  name: Joi.string().min(8).required(),
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
  terms: Joi.string().required(),
  newsletter: Joi.string().optional().allow(null),
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const joyValidator = joySchema.validate(req.body);
  if (joyValidator.error) {
    return res
      .status(400)
      .json({ message: joyValidator.error.details[0].message });
  }

  const { name, email, phone, role, mailingAddress, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      phone,
      role,
      mailingAddress,
    });

    await User.register(newUser, password);

    const token = jwt.sign(
      { _id: newUser._id, name: newUser.name, role: newUser.role },
      process.env.JWT_KEY,
      { expiresIn: "1hr" }
    );

    res.status(201).json({
      token,
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Server error during login" });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1hr" }
    );

    const redirectUrl =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "salesAgent"
        ? "/salesAgent/dashboard"
        : "/client/dashboard";

    res.status(200).json({ token, redirectUrl });
  })(req, res, next);
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const Joi = require("joi");

// const User = require("../models/users");

// router.get("/signup", async (req, res) => {
//   res.render("signup");
// });

// const joySchema = Joi.object({
//   name: Joi.string().min(8).required(),
//   email: Joi.string().email().required(),
//   phone: Joi.number().optional().allow(null, ""),
//   role: Joi.string().valid("client", "admin", "salesAgent").required(),
//   mailingAddress: Joi.string().when("role", {
//     is: "client",
//     then: Joi.string().required(),
//     otherwise: Joi.string().allow("", null),
//   }),
//   password: Joi.string().min(5).required(),
//   confirmPassword: Joi.string()
//     .valid(Joi.ref("password"))
//     .required()
//     .messages({ "any.only": "Passwords do not match" }),
//   terms: Joi.string().required(),
//   newsletter: Joi.string().optional().allow(null),
// });

// router.post("/signup", async (req, res) => {
//   // >..>>>> Validating User Input Information from the Front end aka 'Request body' <<<<<<<
//   const joyValidator = joySchema.validate(req.body);
//   if (joyValidator.error) {
//     return res
//       .status(400)
//       .json({ message: joyValidator.error.details[0].message });
//   }

//   // >>>>> Destructuring User information for easy readabilty <<<<<<<
//   const { name, email, phone, role, mailingAddress, password } = req.body;

//   // >>>>> REMOVE confirmPassword, terms, and newsletter before saving to DB <<<<<
//   delete req.body.confirmPassword;
//   delete req.body.terms;
//   delete req.body.newsletter;

//   //  >>>>>>>>>>  Checking if User is already in the Data base <<<<<<<<
//   const user = await User.findOne({ email: email });
//   if (user) {
//     return res.status(400).json({ message: "User already exists" });
//   }
//   //  >>>> if user not found Create a new one >>>>>>>
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = new User({
//     name: name,
//     email: email,
//     phone: phone,
//     role: role,
//     password: hashedPassword,
//     mailingAddress: mailingAddress,
//   });

//   await newUser.save();
//   const token = jwt.sign(
//     { _id: newUser._id, name: newUser.name },
//     process.env.JWT_KEY,
//     { expiresIn: "1hr" }
//   );

//   res.status(201).json(token);
// });

// // >>>>>>>>>>> Login Route >>>>>>>>>>>>>
// router.get("/login", (req, res) => {
//   res.render("login");
// });
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   // >>>>>> Checking If User is in the Database >>>>>>>
//   const user = await User.findOne({ email: email });
//   if (!user) {
//     return res.status(401).json({ message: "Invalid Credentials" });
//   }

//   // >>>>> Comparing User Password with Hashed Password in The DB >>>>>>
//   const storedPassword = await bcrypt.compare(password, user.password);
//   if (!storedPassword) {
//     return res.status(401).json({ message: "Invalid Credentials" });
//   }

//   // Creating JWT for the user and sending it in the response
//   const token = jwt.sign(
//     { _id: user._id, name: user.name, role: user.role },
//     process.env.JWT_KEY,
//     { expiresIn: "1hr" }
//   );

//   // >>>>> REDIRECTING BASED ON USER ROLE <<<<<
//   if (user.role === "admin") {
//     // Redirect to the admin dashboard
//     return res
//       .status(200)
//       .json({ token: token, redirectUrl: "/admin/dashboard" });
//   } else if (user.role === "salesAgent") {
//     // Redirect to the sales agent dashboard
//     return res
//       .status(200)
//       .json({ token: token, redirectUrl: "/salesAgent/dashboard" });
//   } else {
//     // Default to the client dashboard for all other roles (including "client")
//     return res
//       .status(200)
//       .json({ token: token, redirectUrl: "/client/dashboard" });
//   }
// });
// module.exports = router;
