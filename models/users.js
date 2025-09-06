const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
      required: false,
    },
    googleId: {
      type: String,
      sparse: true, // Allows null values while maintaining uniqueness for non-null values
      index: true, // Add index for faster queries
    },
    role: {
      type: String,
      enum: ["client", "admin", "salesAgent"],
      default: "client",
    },
    mailingAddress: {
      type: String,
      required: function () {
        // Only require mailing address for clients who don't use Google auth
        return this.role === "client" && !this.googleId;
      },
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Add created/updated timestamps
  }
);

// Add compound index for email and googleId for faster lookups
userSchema.index({ email: 1, googleId: 1 });

// Apply passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  // Don't require username/password for Google users
  skipMissingPasswordError: true,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
