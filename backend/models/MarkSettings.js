const mongoose = require("mongoose");

const MarkSettingsSchema = new mongoose.Schema({
  department: { type: String, required: true, unique: true },
  midMax: Number,
  assignmentMax: Number,
  totalInternalMax: Number
});

module.exports = mongoose.model("MarkSettings", MarkSettingsSchema);