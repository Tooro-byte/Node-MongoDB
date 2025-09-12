const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["client", "admin", "salesAgent"],
      default: "client",
    },
    mailingAddress: {
      type: String,
      required: function () {
        return this.role === "client" && !this.googleId && !this.facebookId;
      },
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create partial unique indexes - only index when the field exists and is not null
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true, $type: "string", $ne: null, $ne: "" },
    },
  }
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      googleId: { $exists: true, $type: "string", $ne: null, $ne: "" },
    },
  }
);

userSchema.index(
  { facebookId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      facebookId: { $exists: true, $type: "string", $ne: null, $ne: "" },
    },
  }
);

// Pre-save middleware to clean up social IDs for non-social users
userSchema.pre("save", function (next) {
  console.log("Saving user:", JSON.stringify(this, null, 2));

  // Validate that user has either email or social ID
  if (!this.email && !this.googleId && !this.facebookId) {
    return next(new Error("User must have a valid email or social ID"));
  }

  // Remove social ID fields entirely if they are null, undefined, or empty
  // This ensures they don't get saved to the database at all
  if (!this.googleId || this.googleId === null || this.googleId === "") {
    delete this.googleId;
    this.$unset = this.$unset || {};
    this.$unset.googleId = 1;
  }

  if (!this.facebookId || this.facebookId === null || this.facebookId === "") {
    delete this.facebookId;
    this.$unset = this.$unset || {};
    this.$unset.facebookId = 1;
  }

  next();
});

// Apply passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  skipMissingPasswordError: true,
  usernameUnique: false,
  errorMessages: {
    MissingPasswordError: "Password is required",
    AttemptTooSoonError: "Account is currently locked. Try again later.",
    TooManyAttemptsError:
      "Account locked due to too many failed login attempts.",
    NoSaltValueStoredError:
      "Authentication not possible. No salt value stored.",
    IncorrectPasswordError: "Password or email is incorrect.",
    IncorrectUsernameError: "Password or email is incorrect.",
    MissingUsernameError: "Email is required",
    UserExistsError: "A user with the given email is already registered",
  },
});

// Static method for social auth
userSchema.statics.findOrCreateSocialUser = async function (profile, provider) {
  try {
    const providerId = provider === "facebook" ? profile.id : profile.id;
    if (!providerId) {
      throw new Error(`No ${provider} ID provided in profile`);
    }

    const email =
      profile.emails?.[0]?.value ||
      `${provider}_${providerId}@placeholder.local`;

    let user = await this.findOne({
      $or: [{ [`${provider}Id`]: providerId }, { email }],
    });

    if (user) {
      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = providerId;
        await user.save();
      }
      return user;
    }

    const newUserData = {
      name:
        profile.displayName ||
        `${profile.name?.givenName || ""} ${
          profile.name?.familyName || ""
        }`.trim() ||
        "Unknown User",
      email,
      role: "client",
      lastLogin: new Date(),
    };

    // Only add the social ID field that's relevant
    newUserData[`${provider}Id`] = providerId;

    const newUser = new this(newUserData);
    return await newUser.save();
  } catch (error) {
    console.error(`Error in findOrCreateSocialUser for ${provider}:`, error);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
