const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Item = require("./Item.js");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/lostfound", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.get("/", (req, res) => {
    res.send("Lost and Found API is running.");
  });
  

app.get("/api/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post("/api/items", async (req, res) => {
  const { title, description, type, location } = req.body;
  const newItem = new Item({ title, description, type, location });
  await newItem.save();
  res.json(newItem);
});

app.listen(5000, () => console.log("Server started on http://localhost:5000"));
