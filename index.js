// <<<<<<<<< Configuring the different DOTENV Files >>>>>>>>>>
require("dotenv").config();
require("./config/passport");

// >>>>>>> My E-commerce Website Dependencies <<<<<<<<
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const expressSession = require("express-session")({
  secret: "Tooro-byte",
  resave: false,
  saveUninitialized: false,
});

// >>>>>>> My E-commerce Website Instantiations <<<<<<<<
const app = express();
const PORT = process.env.PORT || 3005;

const User = require("./models/users");

// >>>>>> Import Routes from multiple sources and use them here! <<<<<<<<<<<<
const userSigup = require("./routes/userAuth");
const authRoutes = require("./routes/auth");
const clientPage = require("./routes/client");
const salesPage = require("./routes/salesAgent");
const adminPage = require("./routes/admin");
const categoryRouter = require("./routes/categoryRoutes");
const indexRouter = require("./routes/indexRoute");
const sideBarSales = require("./routes/salesSideBarRoutes");

// >>>>>>>>> Handling JSON Objects with the Express Middleware <<<<<<<
app.use(express.json());

// >>>>>>>>>>> Setting up templating Engines <<<<<<<<<<
app.set("view engine", "pug");
app.set("views", "./views");

// >>>>>>>>>>> More Middlewares <<<<<<<<<<
// Updated: Configure helmet's Content Security Policy to allow YouTube iframes, scripts, and styles
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://kit.fontawesome.com",
        "'unsafe-inline'", // Allows inline scripts in your Pug file
        "https://www.youtube.com", // Added for YouTube embed scripts
        "https://s.ytimg.com", // Added for YouTube iframe player scripts
      ],
      styleSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://fonts.googleapis.com",
        "'unsafe-inline'", // Allows inline styles in your Pug file
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: [
        "'self'",
        "https://www.youtube.com", // Added to allow YouTube iframes
        "https://www.youtube-nocookie.com", // Optional: For privacy-enhanced mode
      ],
      imgSrc: ["'self'", "data:", "https://i.ytimg.com"], // Added for YouTube thumbnails
      connectSrc: ["'self'", "https://www.youtube.com"], // Optional: For YouTube API connections
    },
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// >>>>>>>>> Express Session Configurations >>>>>>>>
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

// >>>>>>>> Adding Morgan Middleware to Log HTTP Requests <<<<<<<<<<
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("Morgan on It");
}
// >>>>>>> Connecting to MongoDB Service <<<<<<
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("MongoDB Connection was successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}
connectToDatabase();

// >>>>>>>> Passport Configurations <<<<<<<<<<
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// >>>>>>> Use the already imported Routes <<<<<<<<<
app.use("/", indexRouter);

// Follow with all other routes.
app.use("/", userSigup);
app.use("/api/auth", authRoutes);
app.use("/", clientPage);
app.use("/", salesPage);
app.use("/", adminPage);
app.use("/", categoryRouter);
app.use("/", sideBarSales);

// Handling Non-existing routes.
app.use((req, res) => {
  console.log("404 - Route not found:", req.originalUrl);
  res.status(404).send("Error, Page not found");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message, err.stack);
  res.status(500).send("Internal Server Error");
});

// >>>>>>>>>>>>> Bootstrapping the Server <<<<<<<<<<
app.listen(PORT, () => {
  console.log(`Secure connection on ${PORT} `);
});
