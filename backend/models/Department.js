const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  type: String,       // BTECH / DIPLOMA / PG
  name: String,       // CSE / ECE
  hod: String,
  totalSemesters: Number,
  sections: [String]
});

module.exports = mongoose.model("Department", DepartmentSchema);