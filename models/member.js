const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  borrower: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  returnDate: { type: Date, default: null },
});

module.exports = mongoose.model('Member', memberSchema);
