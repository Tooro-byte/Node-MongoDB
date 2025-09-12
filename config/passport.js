const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/users");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3005/api/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        console.log("Google profile received:", profile);

        // Check if user already exists with this Google ID first
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log("Existing user found with Google ID:", user.email);
          // Update user info with latest Google data
          user.name =
            profile.displayName ||
            profile.name?.givenName + " " + profile.name?.familyName ||
            "Google User";
          user.email = profile.emails[0].value;
          user.lastLogin = new Date();
          await user.save();
          console.log("Updated existing user with latest Google data");
          return done(null, user);
        }

        // Check if user exists with same email but no Google ID (for linking accounts)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log(
            "Found existing user by email, linking Google account:",
            user.email
          );
          user.googleId = profile.id;
          // Update name with Google data if it's different
          user.name =
            profile.displayName ||
            profile.name?.givenName + " " + profile.name?.familyName ||
            user.name;
          user.lastLogin = new Date();
          await user.save();
          console.log("Successfully linked Google account to existing user");
          return done(null, user);
        }

        // Create completely new user
        console.log("Creating new user from Google profile");
        const newUser = new User({
          name: (
            profile.displayName ||
            profile.name?.givenName + " " + profile.name?.familyName ||
            "Google User"
          ).toLowerCase(),
          email: profile.emails[0].value.toLowerCase(),
          googleId: profile.id,
          role: "client", // Default role for Google users
          mailingAddress: "", // Not required for Google users
          newsletter: false,
          lastLogin: new Date(),
        });

        await newUser.save();
        console.log(
          "Successfully created new Google user:",
          newUser.email,
          "with ID:",
          newUser._id
        );
        return done(null, newUser);
      } catch (error) {
        console.error("Google Strategy error:", error.message, error.stack);
        return done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user._id);
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user:", id);
    const user = await User.findById(id);
    if (!user) {
      console.error("User not found during deserialization:", id);
      return done(new Error("User not found"), null);
    }
    done(null, user);
  } catch (error) {
    console.error("Deserialization error:", error);
    done(error, null);
  }
});

//>>>>>>>>> Incorporating Facebook in the application >>>>>>>>>>
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  console.log("Initializing Facebook Strategy with:", {
    clientID: process.env.FACEBOOK_APP_ID ? "Present" : "Missing",
    clientSecret: process.env.FACEBOOK_APP_SECRET ? "Present" : "Missing",
    callbackURL:
      process.env.FACEBOOK_CALLBACK_URL ||
      "http://localhost:3005/api/auth/facebook/callback",
  });

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL:
          process.env.FACEBOOK_CALLBACK_URL ||
          "http://localhost:3005/api/auth/facebook/callback",
        profileFields: [
          "id",
          "emails",
          "name",
          "displayName",
          "picture.type(large)",
        ],
        enableProof: false, // Set to false for easier debugging
        authType: "rerequest", // Forces permission dialog
        display: "popup",
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          console.log("=== FACEBOOK STRATEGY CALLBACK ===");
          console.log(
            "Access Token received:",
            accessToken ? "Present" : "Missing"
          );
          console.log("Profile received:", {
            id: profile.id,
            email: profile.emails?.[0]?.value || "No email",
            name: profile.displayName,
            profileData: profile._json,
          });

          // Handle case where no email is provided by Facebook
          let email = profile.emails?.[0]?.value;

          // If no email from Facebook, create a placeholder email
          if (!email) {
            email = `facebook_${profile.id}@placeholder.local`;
            console.warn("No email from Facebook, using placeholder:", email);
          }

          // Check if user already exists
          let user = await User.findOne({
            $or: [{ email: email }, { facebookId: profile.id }],
          });

          if (user) {
            console.log("Existing user found:", user._id);
            // Update Facebook ID and email if not set
            let updated = false;
            if (!user.facebookId) {
              user.facebookId = profile.id;
              updated = true;
            }
            if (!user.email || user.email.includes("placeholder.local")) {
              user.email = email;
              updated = true;
            }

            user.lastLogin = new Date();
            updated = true;

            if (updated) {
              await user.save();
              console.log("Updated existing user with Facebook data");
            }
            return done(null, user);
          }

          // Create new user
          console.log("Creating new Facebook user");
          user = new User({
            name:
              profile.displayName ||
              profile.name?.givenName + " " + profile.name?.familyName,
            email: email,
            facebookId: profile.id,
            role: "client", // Default role
            lastLogin: new Date(),
            // Skip password requirement for social auth
            skipPasswordValidation: true,
          });

          await user.save();
          console.log("New Facebook user created:", user._id);
          return done(null, user);
        } catch (error) {
          console.error("Facebook Strategy Error:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
          });
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    "Facebook authentication disabled: Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET environment variables"
  );
}

module.exports = passport;
