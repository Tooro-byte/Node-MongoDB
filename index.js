const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const app = express();

//Import Routes from multipe sources and use them here!
const carsRoute = require("./routes/carsRoutes");

require("dotenv").config({
  path: envFile,
});
console.log(process.env.KEY);

const PORT = process.env.PORT || 3005;

//Handling JSON Objects with the Express Middleware
app.use(express.json());

// Setting up templating Engines
app.set("view engine", "pug");
app.set(express.static("views"));
//More Middlewares
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
//Adding Morgan Middleware to Log HTTP Requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("Morgan on It");
}

//Use the already imported Routes
app.use("/", carsRoute);

app.listen(PORT, (req, res) => {
  console.log(`Secure connection on ${PORT} `);
});
