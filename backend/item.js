const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ["lost", "found"], required: true },
    location: String,
    contact: String,
    imageUrl: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reporter: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
