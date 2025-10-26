import mongoose from 'mongoose';

const footerSchema = new mongoose.Schema({
  contact: {
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  navigate: {
    link1: String,
    link2: String,
    link3: String
  },
  menu: {
    link1: String,
    link2: String,
    link3: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Footer', footerSchema);
