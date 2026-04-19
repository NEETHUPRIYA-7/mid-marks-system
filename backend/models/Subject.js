const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: String,
  code: String,
  department: String,
  semester: Number,
  credits: Number
});

module.exports = mongoose.model("Subject", subjectSchema);