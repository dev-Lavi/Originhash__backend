import Certificate from "../models/Certificate.js";
import path from "path";

// ✅ Step 1: Verify Certificate by ID (before payment)
export const verifyCertificate = async (req, res) => {
  try {
    const { uniqueId } = req.body;

    const cert = await Certificate.findOne({ uniqueId });

    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Return certificate info, not verified yet
    res.json({
      success: true,
      message: "Certificate found. Please proceed to payment.",
      cert: {
        studentName: cert.studentName,
        courseName: cert.courseName,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        uniqueId: cert.uniqueId,
        verified: cert.verified,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Step 2: After dummy payment → verify certificate + store card details
export const confirmPaymentAndVerify = async (req, res) => {
  try {
    const { uniqueId, cardNumber, expiryMonth, expiryYear, cvCode } = req.body;

    // 1️⃣ Find certificate
    const cert = await Certificate.findOne({ uniqueId });
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // 2️⃣ Simulate payment success
    const paymentStatus = "success"; // dummy payment always passes

    if (paymentStatus === "success") {
      // 3️⃣ Mark as verified
      cert.verified = true;

      // 4️⃣ Save payment details (dummy - mask sensitive data!)
      cert.paymentDetails = {
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
        expiryMonth,
        expiryYear,
      };

      await cert.save();

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      return res.json({
        success: true,
        message: "Payment successful. Certificate verified.",
        cert: {
          studentName: cert.studentName,
          courseName: cert.courseName,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          uniqueId: cert.uniqueId,
          verified: cert.verified,
          pngUrl: cert.imageLink
            ? `${baseUrl}/uploads/${path.basename(cert.imageLink)}`
            : null,
          pdfUrl: cert.pdfLink
            ? `${baseUrl}/uploads/${path.basename(cert.pdfLink)}`
            : null,
        },
      });
    } else {
      return res.status(400).json({ success: false, message: "Payment failed" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

