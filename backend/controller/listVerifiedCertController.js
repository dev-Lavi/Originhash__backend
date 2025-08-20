import Certificate from "../models/Certificate.js";

// ✅ 1. List verified certificates by the current logged-in admin
export const listVerifiedCertificatesByAdmin = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      issuerAdminId: req.user._id,
      verified: true,
    }).populate("issuerAdminId", "name email");

    res.json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (err) {
    console.error("Error fetching verified certificates (admin):", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ 2. List all verified certificates (SuperAdmin only)
export const listAllVerifiedCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      verified: true,
    }).populate("issuerAdminId", "name email");

    res.json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (err) {
    console.error("Error fetching verified certificates (superadmin):", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
