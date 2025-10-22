import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  picture: {
    url: String,
    filename: String
  }
});

const coreMenuSchema = new mongoose.Schema({
  coreTitle: {
    type: String,
    required: true
  },
  sno: {
    type: String,
    required: true,
    unique: true
  },
  menuItems: [menuItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CoreMenu', coreMenuSchema);
