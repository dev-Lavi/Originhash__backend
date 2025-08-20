import Certificate from "../models/Certificate.js";
import path from "path";

// 🟢 Helper to convert local path to public URL
const convertToPublicUrl = (filePath) => {
  if (!filePath) return null;
  const fileName = path.basename(filePath);
  return `/uploads/${fileName}`;
};

// 🟢 Get all certificates issued by the logged-in admin
export const listMyCertificates = async (req, res) => {
  try {
    let certificates = await Certificate.find({ issuerAdminId: req.user._id })
      .populate("issuerAdminId", "name email role")
      .lean();

    certificates = certificates.map(cert => ({
      ...cert,
      imageLink: convertToPublicUrl(cert.imageLink),
      pdfLink: convertToPublicUrl(cert.pdfLink),
    }));

    res.json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (err) {
    console.error("Error listing my certificates:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🟢 Get all certificates (SuperAdmin only)
export const listAllCertificates = async (req, res) => {
  try {
    let certificates = await Certificate.find()
      .populate("issuerAdminId", "name email role")
      .lean();

    certificates = certificates.map(cert => ({
      ...cert,
      imageLink: convertToPublicUrl(cert.imageLink),
      pdfLink: convertToPublicUrl(cert.pdfLink),
    }));

    res.json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (err) {
    console.error("Error listing all certificates:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
