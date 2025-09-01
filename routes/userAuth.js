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
  phone: Joi.number().required(),
  mailingAddress: Joi.string().required(),
  password: Joi.string().min(10),
});

router.post("/signup", async (req, res) => {
  // >>>>> Destructuring User information for easy readabilty <<<<<<<
  const { name, email, phone, mailingAddress, password } = req.body;

  // >..>>>> Validating User Input Information from the Front end aka 'Request body' <<<<<<<
  const joyValidator = joySchema.validate(req.body);
  if (joyValidator.error) {
    return res.status(400).json(joyValidator.error.details[0].message);
  }
  //  >>>>>>>>>>  Checking if User is already in the Data base <<<<<<<<
  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash("password", 10);
  const newUser = new User({
    name: name,
    email: email,
    phone: phone,
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
  // res.redirect("/login");
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
