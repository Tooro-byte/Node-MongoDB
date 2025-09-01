// <<<<<<<<< Cofiguring the different DOTENV Files >>>>>>>>>>
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

require("dotenv").config({
  path: envFile,
});
console.log(process.env.KEY);

// >>>>>>> My E-commerce Website Dependencies <<<<<<<<
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");

// >>>>>>> My E-commerce Website Instatiations <<<<<<<<
const app = express();
const PORT = process.env.PORT || 3005;

// >>>>>> Import Routes from multipe sources and use them here! <<<<<<<<<<<<
const userSigup = require("./routes/userAuth");

// >>>>>>>>>Handling JSON Objects with the Express Middleware <<<<<<<
app.use(express.json());

// >>>>>>>>>>>Setting up templating Engines <<<<<<<<<<
app.set("view engine", "pug");
app.set(express.static("views"));

// >>>>>>>>>>> More Middlewares <<<<<<<<<<
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// >>>>>>>> Adding Morgan Middleware to Log HTTP Requests <<<<<<<<<<
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("Morgan on It");
}
// >>>>>>>Connecting to MongoDB Service<<<<<<
mongoose
  .connect("mongodb://localhost:27017/mongo-demo")
  .then(() => console.log(" MongoDB Connection was Sucessfull"))
  .catch((err) => console.error(error.message));

// >>>>>>> Use the already imported Routes <<<<<<<<<
app.use("/", userSigup);

// >>>>>>>>>>>>>Boostsrapping th Server <<<<<<<<<<
app.listen(PORT, (req, res) => {
  console.log(`Secure connection on ${PORT} `);
});
