import mongoose from 'mongoose';

const footerRegionSchema = new mongoose.Schema({
  // Section 1: Culture
  cultureTitle: {
    type: String,
    required: true
  },
  cultureImages: [{
    url: String,
    filename: String
  }],
  
  // Section 2: Testimonial
  testimonialTitle: {
    type: String,
    required: true
  },
  testimonialText: {
    type: String,
    required: true
  },
  testimonialImage: {
    url: String,
    filename: String
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

export default mongoose.model('FooterRegion', footerRegionSchema);
