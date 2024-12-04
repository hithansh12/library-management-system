const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Book = require('./models/book');
const Member = require('./models/member');

const app = express();
app.use(bodyParser.json());


mongoose
  .connect('mongodb://localhost:27017/libraryDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));



//1
app.get('/books/available', async (req, res) => {
    try {
      const books = await Book.find({ status: "Available" });
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books', error });
    }
  });


//2 
app.get('/books/:isbn', async (req, res) => {
    const { isbn } = req.params; 
  
    try {
      const book = await Book.findOne({ ISBN: isbn }); 
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (err) {
      res.status(500).json({ message: "Error fetching book", error: err });
    }
  });
  


  //3
  app.post('/books/issue/:id', async (req, res) => {
    try {
      const { mobile, borrower, dueDate } = req.body;
      const book = await Book.findById(req.params.id);
      if (!book || book.status != "Available") {
        return res.status(400).json({ message: 'Book not available for issue' });
      }
  
      book.status = "Available";
      book.borrower = borrower;
      await book.save();
  
      const member = new Member({
        bookId: book._id,
        borrower,
        issueDate: new Date(),
        returnDate: dueDate,
      });
      await member.save();
  
      res.json({ message: 'Book issued successfully', book });
    } catch (error) {
      res.status(500).json({ message: 'Error issuing book', error });
    }
  });



  //4
  app.post('/books/return/:id', async (req, res) => {
    try {
      const { mobile } = req.body;
      const book = await Book.findById(req.params.id);
      if (!book || book.status !== "Available") {
        return res.status(400).json({ message: 'Book not issued' });
      }
  
      book.status = "Issued";
      book.borrower = null;
      await book.save();
  
      const member = await Member.findOne({ bookId: book._id, borrower: mobile });
      if (!member) return res.status(404).json({ message: 'Member not found' });
  
      member.returnDate = new Date();
      await member.save();
  
      res.json({ message: 'Book returned successfully', book });
    } catch (error) {
      res.status(500).json({ message: 'Error returning book', error });
    }
  });

  

  //5
  app.delete('/books/delete/:id', async (req, res) => {
    try {
      const book = await Book.findOneAndDelete({ $or: [{ _id: req.params.id }, { ISBN: req.params.id }] });
      if (!book) return res.status(404).json({ message: 'Book not found' });
      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting book', error });
    }
  });


  //6
  app.post('/members/add', async (req, res) => {
    try {
      const { name, mobile, email } = req.body;
  
      if (!name || !mobile || !email) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const member = new Member({ borrower: name, issueDate: new Date() });
      await member.save();
      res.json({ message: 'Member added successfully', member });
    } catch (error) {
      res.status(500).json({ message: 'Error adding member', error });
    }
  });
  

  //7
  app.put('/members/update/:id', async (req, res) => {
    try {
      const { name, mobile } = req.body;
      const member = await Member.findByIdAndUpdate(req.params.id, { borrower: name, mobile }, { new: true });
      if (!member) return res.status(404).json({ message: 'Member not found' });
      res.json({ message: 'Member updated successfully', member });
    } catch (error) {
      res.status(500).json({ message: 'Error updating member', error });
    }
  });


  //8
  app.delete('/members/delete/:id', async (req, res) => {
    try {
      const member = await Member.findByIdAndDelete(req.params.id);
      if (!member) return res.status(404).json({ message: 'Member not found' });
      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting member', error });
    }
  });


  //9
  const validateRequest = (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({ message: 'Invalid request body' });
    }
    next();
  };
  
  app.use(validateRequest);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  });
  
  
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  
  
  
