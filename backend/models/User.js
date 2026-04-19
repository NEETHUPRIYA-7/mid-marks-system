const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  type: String,
  department: String,
  section: String,
  semester:Number,
  subject:String
});

module.exports = mongoose.model("User", userSchema);