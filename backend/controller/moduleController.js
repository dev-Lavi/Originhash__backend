// controllers/moduleController.js
import Course from "../models/course.js";

export const addLessonToModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, duration, type, courseId } = req.body;

    if (!title || !duration || !courseId || !moduleId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    let finalVideoUrl = null;
    if (req.file) {
      finalVideoUrl = `/uploads/videos/${req.file.filename}`;
    } else if (req.body.videoUrl) {
      finalVideoUrl = req.body.videoUrl;
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ error: "No video provided" });
    }

    const newLesson = {
      title,
      duration,
      videoUrl: finalVideoUrl,
      type: type || "video",
      createdAt: new Date(),
    };

    module.lessons = module.lessons || [];
    module.lessons.push(newLesson);
    module.lessonCount = (module.lessonCount || 0) + 1;

    await course.save();

    res.status(201).json(newLesson);
  } catch (err) {
    console.error("Error adding lesson:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const addModule = async (req, res) => {
  try {
    const { id } = req.params; // course ID
    const { title = "hello" } = req.body; // module title
    console.log(id, title);
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Module title is required" });
    }

    // Find the course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    // console.log(course)
    // Create new module object
    const newModule = { title, videos: [] };
    // console.log("1")
    // Push to course's modules array
    course.modules.push(newModule);
    // console.log("2")

    // Save updated course
    await course.save();
    // console.log("3")

    res.status(201).json({
      message: "Module added successfully",
      module: newModule,
      course,
    });
  } catch (error) {
    console.error("Error adding module:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadVideo = async (req, res) => {
  const { courseId, moduleId, title, duration } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const fileUrl = `/uploads/videos/${req.file.filename}`;

    module.videos.push({ title, url: fileUrl, duration });
    await course.save();

    res.status(200).json({ message: "Video uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// Delete Module
export const deleteModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const moduleIndex = course.modules.findIndex(
      (mod) => mod._id.toString() === moduleId
    );
    if (moduleIndex === -1) {
      return res.status(404).json({ message: "Module not found" });
    }

    course.modules.splice(moduleIndex, 1);
    await course.save();

    res.status(200).json({ message: "Module deleted successfully", course });
  } catch (error) {
    console.error("Error deleting module:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


