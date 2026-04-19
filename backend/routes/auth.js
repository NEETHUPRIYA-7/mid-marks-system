const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const cors = require("cors");

// REGISTER
router.post("/register", async (req, res) => {
  console.log("register api hit");
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
  name,
  email,
  password: password,
  role
});

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", cors({ origin: 'http://localhost:3001', credentials: true }), async (req, res) => {
  try {
    console.log('🔐 POST /api/auth/login hit');
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: "User not found" });
    }
    console.log("typed password:", password);
    console.log("Db password:", user.password);

    if (password !== user.password) {
  console.log("Invalid password for user:", email);
  return res.status(400).json({ message: "Invalid password" });
}

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "mysecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        section: user.section
      }
    });
  } catch (err) {
    console.log('ERROR in /login:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user
  });
});
router.put("/promote", async (req, res) => {
  try {
    const { department, semester } = req.body;

    const result = await User.updateMany(
      {
        role: "student",
        department: department,
        semester: Number(semester)
      },
      {
        $inc: { semester: 1 }
      }
    );

    res.json({
      updatedCount: result.modifiedCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/depromote", async (req, res) => {
  try {
    const { department, semester } = req.body;

    const result = await User.updateMany(
  {
    role: "student",
    department,
    semester: { $eq: Number(semester), $gt: 1 }
  },
  {
    $inc: { semester: -1 }
  }
);
  

    res.json({
      message: "Depromoted",
      updatedCount: result.modifiedCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;