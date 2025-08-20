import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  videoUrl: { type: String, required: true }, // path to uploaded file
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Video', videoSchema);