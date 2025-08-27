const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3005;
const myArrays = [
  {
    id: 1,
    name: "Toyota",
    brand: "Harrier",
    model: 2015,
    milleage: "57000 KM",
    drive: "2WD",
    condition: "Excellent",
    price: 8000,
    selling: "Yes",
  },
  {
    id: 2,
    name: "Mercedes Benz",
    brand: "GLE 400d",
    model: 2015,
    milleage: "51000 KM",
    drive: "2WD",
    condition: "Excellent",
    price: 18000,
    selling: "Yes",
  },
];
//Handling JSON Objects with the Express Middleware
app.use(express.json());
//More Middlewares
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
//Adding Morgan Middleware to Log HTTP Requests
if (process.env.NODE_ENV === "development") {
app.use(morgan("dev"));
console.log("Morgan on It");
}
//Routes are handled here thouroughly well.
app.get("/", (req, res) => {
  res.send("Moving Foward");
});

app.get("/cars", (req, res) => {
  res.send(myArrays);
});

app.get("/cars/:id/", (req, res) => {
  const carsId = parseInt(req.params.id);
  const findCarsId = myArrays.find((car) => car.id === carsId);
  res.send(findCarsId);
});

app.post("/cars", (req, res) => {
  const car = req.body;
  const newCar = {
    //old id = new id +1, getting id of new array object.
    id: myArrays[myArrays.length - 1].id + 1,
    name: car.name,
    brand: car.brand,
    model: car.model,
    milleage: car.milleage,
    drive: car.drive,
    condition: car.condition,
    price: car.price,
    selling: car.selling,
  };
  myArrays.push(newCar);
  res.send(newCar);
});

app.listen(PORT, (req, res) => {
  console.log(`Secure connection on ${PORT} `);
});
