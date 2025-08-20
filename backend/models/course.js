import mongoose from "mongoose";
import Counter from "./counter.js"; // import counter model

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: String },
  type: { type: String, default: "video" },
  createdAt: { type: Date, default: Date.now }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
  lessonCount: { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  modules: [moduleSchema],
  course_ref_id: { type: String, unique: true }, // new field
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
}, { timestamps: true });

// Pre-save hook for auto course_ref_id
courseSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "course_ref_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = String(counter.seq).padStart(6, "0"); // e.g. 000001
    this.course_ref_id = `originhash${seqNumber}`;
  }
  next();
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
