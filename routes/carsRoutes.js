const express = require("express");
const router = express.Router();

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

router.get("/", (req, res) => {
  res.send("Moving Foward");
});

router.get("/cars", (req, res) => {
  res.send(myArrays);
});

router.get("/cars/:id/", (req, res) => {
  const carsId = parseInt(req.params.id);
  const findCarsId = myArrays.find((car) => car.id === carsId);
  res.send(findCarsId);
});

router.post("/cars", (req, res) => {
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

module.exports = router;
