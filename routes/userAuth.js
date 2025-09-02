const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const User = require("../models/users");

router.get("/signup", async (req, res) => {
  res.render("signup");
});

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
  password: Joi.string().min(10).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
  terms: Joi.string().required(),
  newsletter: Joi.string().optional().allow(null),
});

router.post("/signup", async (req, res) => {
  // >..>>>> Validating User Input Information from the Front end aka 'Request body' <<<<<<<
  const joyValidator = joySchema.validate(req.body);
  if (joyValidator.error) {
    return res
      .status(400)
      .json({ message: joyValidator.error.details[0].message });
  }

  // >>>>> Destructuring User information for easy readabilty <<<<<<<
  const { name, email, phone, role, mailingAddress, password } = req.body;

  // >>>>> REMOVE confirmPassword, terms, and newsletter before saving to DB <<<<<
  delete req.body.confirmPassword;
  delete req.body.terms;
  delete req.body.newsletter;

  //  >>>>>>>>>>  Checking if User is already in the Data base <<<<<<<<
  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }
  //  >>>> if user not found Create a new one >>>>>>>
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name: name,
    email: email,
    phone: phone,
    role: role,
    password: hashedPassword,
    mailingAddress: mailingAddress,
  });

  await newUser.save();
  const token = jwt.sign(
    { _id: newUser._id, name: newUser.name },
    process.env.JWT_KEY,
    { expiresIn: "1hr" }
  );

  res.status(201).json(token);
});

// >>>>>>>>>>> Login Route >>>>>>>>>>>>>

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // >>>>>> Checking If User is in the Database >>>>>>>
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  // >>>>> Comparing User Password with Hashed Password in The DB >>>>>>
  const storedPassword = await bcrypt.compare(password, user.password);
  if (!storedPassword) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  // Creating JWT For and Send it in Response
  const token = jwt.sign(
    { _id: user._id, name: user.name },
    process.env.JWT_KEY,
    { expiresIn: "1hr" }
  );
  return res.status(200).json(token);
});

module.exports = router;
