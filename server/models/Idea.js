const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idea: String,
  industry: String,
  audience: String,
  budget: String,
  country: String,
  result: Object,
}, { timestamps: true });

module.exports = mongoose.model('Idea', ideaSchema);