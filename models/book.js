const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  ISBN: { type: String, required: true, unique: true },
  status: { type: String, default: "Available" },
  borrower: { type: String, default: null },
});

module.exports = mongoose.model('Book', bookSchema);
