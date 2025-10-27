import mongoose from 'mongoose';
import crypto from 'crypto';

const userSectionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  referenceNumber: {
    type: String,
    unique: true,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate reference number before saving
userSectionSchema.pre('save', function(next) {
  if (!this.referenceNumber) {
    this.referenceNumber = 'REF-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

export default mongoose.models.UserSection || mongoose.model('UserSection', userSectionSchema);
