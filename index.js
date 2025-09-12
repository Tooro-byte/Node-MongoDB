// <<<<<<<<< Cofiguring the different DOTENV Files >>>>>>>>>>
// const envFile =
//   process.env.NODE_ENV === "production"
//     ? ".env.production"
//     : ".env.development";

// require("dotenv").config({
//   path: envFile,
// });
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

// >>>>>>> My E-commerce Website Instatiations <<<<<<<<
const app = express();
const PORT = process.env.PORT || 3005;

const User = require("./models/users");

// >>>>>> Import Routes from multipe sources and use them here! <<<<<<<<<<<<
const userSigup = require("./routes/userAuth");
const authRoutes = require("./routes/auth");
const clientPage = require("./routes/client");
const salesPage = require("./routes/salesAgent");

// >>>>>>>>>Handling JSON Objects with the Express Middleware <<<<<<<
app.use(express.json());

// >>>>>>>>>>>Setting up templating Engines <<<<<<<<<<
app.set("view engine", "pug");
app.set("views", "./views"); // Fixed: Correctly set views directory

// >>>>>>>>>>> More Middlewares <<<<<<<<<<
app.use(helmet());
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
// >>>>>>>Connecting to MongoDB Service<<<<<<
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log(" MongoDB Connection was Sucessfull"))
  .catch((err) => console.error(err.message));

// >>>>>>>>Passport Configurations <<<<<<<<<<
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// >>>>>>> Use the already imported Routes <<<<<<<<<
app.use("/", userSigup);
app.use("/api/auth", authRoutes);
app.use("/", clientPage);
app.use("/", salesPage);

// Placeholder dashboard route
app.get("/dashboard", (req, res) => {
  console.log("Dashboard route reached");
  res.send("Dashboard Reached"); // Replace with your actual dashboard view
});

//Handling Non -existing routes.
app.use((req, res) => {
  console.log("404 - Route not found:", req.originalUrl);
  res.status(404).send("Error, Page not found");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message, err.stack);
  res.status(500).send("Internal Server Error");
});

// >>>>>>>>>>>>>Boostsrapping th Server <<<<<<<<<<
app.listen(PORT, () => {
  console.log(`Secure connection on ${PORT} `);
});
