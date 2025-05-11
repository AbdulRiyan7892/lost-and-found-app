const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Item = require("./item");
const User = require("./User");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Atlas connection

const uri = "mongodb+srv://abdulriyan062:gFv86I0pPJ2cVK8L@ar.w0ay8z9.mongodb.net/lostfound?retryWrites=true&w=majority&appName=AR";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas via Mongoose");

  // Start server **only after successful DB connection**
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, password: hashed });
    await user.save();
    res.status(201).json({ message: "Registered" });
  } catch {
    res.status(400).json({ error: "User exists or invalid data" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
  res.json({ token });
});

// Get all items
app.get("/api/items", async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
});

// Post new item (only logged-in users)
app.post("/api/items", auth, upload.single("image"), async (req, res) => {
  const { title, description, type, location, contact } = req.body;
  const imageUrl = req.file ? `https://lost-and-found-app-1.onrender.com/uploads/${req.file.filename}` : null;


  const newItem = new Item({
    title,
    description,
    type,
    location,
    contact,
    imageUrl,
    userId: req.user.userId,
    reporter: req.user.username,
  });

  await newItem.save();
  res.status(201).json(newItem);
});

// Delete item (only by reporter)
app.delete("/api/items/:id", auth, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item || item.userId.toString() !== req.user.userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  await item.deleteOne();
  res.json({ message: "Item deleted" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
