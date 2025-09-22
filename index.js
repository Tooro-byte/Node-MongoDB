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
  secret: process.env.SESSION_SECRET || "Tooro-byte", // Use env variable for secret
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
const sideBarSales = require("./routes/salesSideBarRoutes"); // Consider renaming for clarity
const addNewProuct = require("./routes/addNewProduct");

// >>>>>>>>> Handling JSON Objects with the Express Middleware <<<<<<<
app.use(express.json());
app.use("/upload/category", express.static("upload/category"));

// >>>>>>>>>>> Setting up Templating Engines <<<<<<<<<<
app.set("view engine", "pug");
app.set("views", "./views");

// >>>>>>>>>>> More Middlewares <<<<<<<<<<
// Updated: Configure helmet's Content Security Policy to allow Font Awesome, YouTube, Google, and Facebook
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://kit.fontawesome.com",
        "'unsafe-inline'", // Allows inline scripts in Pug files
        "https://www.youtube.com", // For YouTube embed scripts
        "https://s.ytimg.com", // For YouTube iframe player scripts
      ],
      styleSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com", // Added for Font Awesome CSS
        "'unsafe-inline'", // Allows inline styles in Pug files
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com", // Added for Font Awesome font files
      ],
      frameSrc: [
        "'self'",
        "https://www.youtube.com", // For YouTube iframes
        "https://www.youtube-nocookie.com", // For privacy-enhanced YouTube mode
      ],
      imgSrc: [
        "'self'",
        "data:", // For base64-encoded images
        "https://i.ytimg.com", // For YouTube thumbnails
      ],
      connectSrc: [
        "'self'",
        "https://www.youtube.com", // For YouTube API connections
        "https://accounts.google.com", // For Google OAuth
        "https://www.googleapis.com", // For Google API
        "https://www.facebook.com", // For Facebook OAuth
        "https://graph.facebook.com", // For Facebook API
      ],
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
  console.log("Morgan enabled for development");
}

// >>>>>>> Connecting to MongoDB Service <<<<<<
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE, {});
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit on DB connection failure
  }
}
connectToDatabase();

// >>>>>>>> Passport Configurations <<<<<<<<<<
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// >>>>>>> Use the already imported Routes <<<<<<<<<
app.use("/", indexRouter);
app.use("/", userSigup);
app.use("/api/auth", authRoutes);
app.use("/", clientPage);
app.use("/", salesPage);
app.use("/", adminPage);
app.use("/", categoryRouter);
app.use("/", sideBarSales);
app.use("/", addNewProuct);

// Handling Non-existing routes
app.use((req, res) => {
  console.log("404 - Route not found:", req.originalUrl);
  res.status(404).send("Bad Request, Page Not Found");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message, err.stack);
  res
    .status(500)
    .render("error", { title: "Server Error", error: err.message }); // Consider rendering a Pug template for errors
});

// >>>>>>>>>>>>> Bootstrapping the Server <<<<<<<<<<
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
