const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    minlength: [10, 'A tour name must have more or equal then 10 characters'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Item must have a description'],
  },
  price: {
    type: Number,
    required: [true, 'Item must have a price'],
  },
  category: {
    type: String,
    uppercase: true,
    enum: ['FASHION', 'TENT', 'ACCESSORIES'],
  },
  image: {
    type: String,
    required: [true, 'Item must have an image'],
  },
});

//Convention to capitalize model
const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
