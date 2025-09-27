// index.js
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
  secret: process.env.SESSION_SECRET || "Tooro-byte",
  resave: false,
  saveUninitialized: false,
});
const http = require("http");
const { Server } = require("socket.io");
// >>>>>>> My E-commerce Website Instantiations <<<<<<<<
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.locals.io = io;
const PORT = process.env.PORT || 3005;

const User = require("./models/users");

// >>>>>> Import Routes from multiple sources and use them here! <<<<<<<<<<<<
const userSigup = require("./routes/userAuth");
const authRoutes = require("./routes/auth");
const clientPage = require("./routes/client");
const salesPage = require("./routes/salesAgent");
const adminPage = require("./routes/admin"); // The admin router
const categoryRouter = require("./routes/categoryRoutes");
const indexRouter = require("./routes/indexRoute");
const myPages = require("./routes/webPages");

// >>>>>>>>> Handling JSON Objects with the Express Middleware <<<<<<<
app.use(express.json());
app.use("/upload/category", express.static("upload/category"));
app.use("/upload/products", express.static("upload/products")); // Added: to serve product images

// >>>>>>>>>>> Setting up Templating Engines <<<<<<<<<<
app.set("view engine", "pug");
app.set("views", "./views");

// >>>>>>>>>>> More Middlewares <<<<<<<<<<
// [Your existing helmet configuration remains here...]
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://kit.fontawesome.com",
        "'unsafe-inline'",
        "https://www.youtube.com",
        "https://s.ytimg.com",
      ],
      styleSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
        "'unsafe-inline'",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],
      frameSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
      ],
      imgSrc: ["'self'", "data:", "https://i.ytimg.com"],
      connectSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://accounts.google.com",
        "https://www.googleapis.com",
        "https://www.facebook.com",
        "https://graph.facebook.com",
        "ws://localhost:3005",
        "wss://localhost:3005",
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
    process.exit(1);
  }
}
connectToDatabase();

// >>>>>>>> Passport Configurations <<<<<<<<<<
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// >>>>>>> Socket.IO Connection Handling <<<<<<<<
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// >>>>>>> Use the already imported Routes <<<<<<<<<
// Mount Admin routes at /admin
app.use("/", adminPage);

// Other Routes (ensure they don't conflict with /admin/*)
app.use("/", indexRouter);
app.use("/", userSigup);
app.use("/api/auth", authRoutes);
app.use("/", clientPage);
app.use("/", salesPage);
app.use("/", categoryRouter);
app.use("/", myPages);
// app.use("/", addNewProuct); // Removed

// Handling Non-existing routes
app.use((req, res) => {
  console.log("404 - Route not found:", req.originalUrl);
  // Sending a clearer response
  res.send(" Bad Request, Page Not Found");
});

// >>>>>>>>>>>>> Bootstrapping the Server <<<<<<<<<<
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
