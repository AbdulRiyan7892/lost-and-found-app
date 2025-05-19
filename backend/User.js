const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  contact: String, // Add this
});


module.exports = mongoose.model("User", userSchema);
