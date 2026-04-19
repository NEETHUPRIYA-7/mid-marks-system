const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  semester: Number,
  section: String
});

module.exports = mongoose.model("Student", studentSchema);