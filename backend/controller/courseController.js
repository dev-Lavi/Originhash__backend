import Course from "../models/course.js";
import path from "path";
import fs from "fs";

export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const thumbnail = req.file;  // multer puts single file here

    if (!title || !description || !thumbnail) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Use multer’s saved file path to build the accessible URL
    const filePath = `/uploads/images/${thumbnail.filename}`;

    const course = await Course.create({
      title,
      description,
      thumbnail: filePath,
      createdBy: req.adminId,
    });

    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create course", error: err.message });
  }
};





export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('createdBy', 'username');
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    // console.log(course)
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.createdBy.toString() !== req.adminId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own course' });
    }
    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const fetchCourseDetails = async (req, res) => {
  try {
    const { id } = req.params; // course ID from URL
    // console.log(id);
    // Fetch course with all embedded modules and videos
    const course = await Course.findById(id)
      .populate("createdBy", "username email") // optional: get creator info
      .lean(); // return plain JS object for performance
    // console.log(course)
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Ensure modules and videos are at least empty arrays if missing
    course.modules = course.modules || [];
    course.modules.forEach((mod) => {
      mod.videos = mod.videos || [];
    });

    res.status(200).json(course);
  } catch (err) {
    console.error("Error fetching course details:", err);
    res.status(500).json({ message: "Server error" });
  }
};
