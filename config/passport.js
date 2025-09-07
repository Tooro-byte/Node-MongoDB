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
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

//>>>>>>>>> Incorporating Facebook in the application >>>>>>>>>>
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3005/api/auth/facebook/callback",
        passReqToCallback: true,
        profileFields: [
          "id",
          "emails",
          "name",
          "displayName",
          "picture.type(large)",
        ],
      },
      async function (req, accessToken, refreshToken, profile, done) {
        try {
          console.log("=== FACEBOOK STRATEGY CALLBACK ===");
          console.log("Profile received:", {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
          });

          const email = profile.emails?.[0]?.value;
          if (!email) {
            console.error("No email found in Facebook profile");
            return done(new Error("No email found in Facebook profile"), null);
          }

          // Check if user already exists
          let user = await User.findOne({
            $or: [{ email: email }, { facebookId: profile.id }],
          });

          if (user) {
            console.log("Existing user found:", user._id);
            // Update Facebook ID if not set
            if (!user.facebookId) {
              user.facebookId = profile.id;
              await user.save();
              console.log("Updated existing user with Facebook ID");
            }
            return done(null, user);
          }

          // Create new user
          console.log("Creating new Facebook user");
          user = new User({
            name: profile.displayName,
            email: email,
            facebookId: profile.id,
            role: "client", // Default role
          });

          await user.save();
          console.log("New Facebook user created:", user._id);
          return done(null, user);
        } catch (error) {
          console.error("Facebook Strategy Error:", error);
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

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
