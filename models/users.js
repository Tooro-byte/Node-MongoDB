const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: Number,
  },
  password: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["client", "admin", "salesAgent"],
    default: "client",
  },
  mailingAddress: {
    type: String,
    required: function () {
      return this.role === "client";
    },
  },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

const User = mongoose.model("User", userSchema);
module.exports = User;
