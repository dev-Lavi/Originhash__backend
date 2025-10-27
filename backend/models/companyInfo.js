import mongoose from 'mongoose';

const companyInfoSchema = new mongoose.Schema({
  companyName: {
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
  },
  logoPath: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.CompanyInfo || mongoose.model('CompanyInfo', companyInfoSchema);
