import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
password: {
  type: String,
},
  role: {
    type: String,
    enum: ['admin', 'individual', 'corporate'],
    default: 'individual',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  refreshToken: String,

  // Login attempt handling
  loginAttempts: {
    type: Number,
    required: true,
    default: 0,
  },
  lockUntil: Date,
}, { timestamps: true });

// Virtual to check if account is currently locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
