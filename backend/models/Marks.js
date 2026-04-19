const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: String,
  name: String,

  department: String,
  semester: Number,
  section: String,

  subject: String,

  faculty: String,     // name (for display)
  facultyId: String,   // 🔥 ADD THIS

  mid1: Number,
  mid2: Number,
  assignment1: Number,
  assignment2: Number,

  total: Number,
  reason: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    default: "draft"
  }
}, { timestamps: true });

module.exports = mongoose.model("Marks", marksSchema);