const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // 👈 VERY IMPORTANT
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject", // 👈 VERY IMPORTANT
  },
  department: String,
  semester: String,
  section: String,
});

module.exports = mongoose.model("Assignment", assignmentSchema);