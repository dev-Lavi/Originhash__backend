import mongoose from 'mongoose';

const headerRegionSchema = new mongoose.Schema({
  coreTitle: {
    type: String,
    required: true
  },
  aboutUs: {
    type: String,
    required: true
  },
  core: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  heroTitle: {
    type: String,
    required: true
  },
  menuImages: [{
    url: String,
    filename: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('HeaderRegion', headerRegionSchema);
