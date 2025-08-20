import { v4 as uuidv4 } from "uuid";
import { generateHash } from "../utils/hashUtil.js";
import nodemailer from "nodemailer";
import { generateCertificate } from "../utils/generateCert.js";
import { sendCertificateEmail } from "../utils/email.js";
import Certificate from "../models/Certificate.js";
import fs from "fs";
import path from "path";

export const previewCertificate = async (req, res) => { 
  try {
    const { studentName, courseName, issueDate, expiryDate } = req.body;
    const uniqueId = uuidv4();

    const preview = await generateCertificate(
      { studentName, courseName, issueDate, expiryDate, uniqueId },
      true
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Generate unique query param
    const previewToken = uuidv4();

    const previewLink = `${baseUrl}${preview.pngPath}?previewId=${previewToken}`;
    const pdfPreview = `${baseUrl}${preview.pdfPath}?previewId=${previewToken}`;

    res.json({
      success: true,
      previewLink,
      pdfPreview,
      previewId: previewToken  // optional: return for debugging
    });

    // Auto-delete after 5 minutes
    setTimeout(() => {
      try {
        if (fs.existsSync(preview.pngPath)) fs.unlinkSync(preview.pngPath);
        if (fs.existsSync(preview.pdfPath)) fs.unlinkSync(preview.pdfPath);
        console.log(`🗑️ Preview files deleted: ${preview.pngPath}, ${preview.pdfPath}`);
      } catch (err) {
        console.error("Auto-delete error:", err.message);
      }
    }, 5 * 60 * 1000);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    const { studentEmail, studentName, courseName, issueDate, expiryDate } = req.body;
    const issuerAdminId = req.user.id;

    const uniqueId = uuidv4();
    const hash = generateHash(studentEmail + courseName + uniqueId);

        // Convert expiryDate to null if not provided
    const expiryDateValue = expiryDate && expiryDate.trim() !== "" ? new Date(expiryDate) : null;

    // Format dates for email
    const formattedIssue = new Date(issueDate).toLocaleDateString();
    const formattedExpiry = expiryDateValue ? expiryDateValue.toLocaleDateString() : "None";

    // Generate certificate files
    const { pngPath, pdfPath } = await generateCertificate({
      studentName,
      courseName,
      issueDate,
      expiryDate: expiryDateValue,
      uniqueId
    });

    // Save to DB
    const cert = new Certificate({
      issuerAdminId,
      studentEmail,
      studentName,
      courseName,
      issueDate: new Date(issueDate),
      expiryDate: expiryDateValue,
      uniqueId,
      hash,
      imageLink: pngPath,
      pdfLink: pdfPath,
    });
    await cert.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Certificate Admin" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: "🎉 Your Certificate Has Been Issued",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 20px; text-align: center; border: 1px solid #ddd;">
            <h2 style="color: #2e7d32; margin-bottom: 10px;">Certificate of Appreciation</h2>
            <p style="font-size: 16px; color: #555;">This is to certify that</p>
            <h3 style="font-size: 22px; margin: 5px 0; color: #000;">${studentName}</h3>
            <p style="font-size: 16px; color: #555;">has successfully completed <b>${courseName}</b></p>
            <p style="font-size: 14px; color: #777;">
              Issued: ${formattedIssue} <br>
              Expires: ${formattedExpiry}
            </p>
            <div style="margin: 15px 0;">
              <span style="background-color: #eee; padding: 6px 12px; font-size: 13px; border-radius: 5px; display: inline-block;">
                Certificate ID: ${uniqueId}
              </span>
            </div>
            <p style="font-size: 15px; color: #555;">You can download your certificate below:</p>
            <a href="${process.env.BASE_URL}/uploads/cert-${uniqueId}.pdf" 
               style="background-color: #d32f2f; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              Download PDF
            </a>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `certificate-${studentName}.pdf`,
          path: pdfPath,
        },
      ],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.json({
      success: true,
      message: "Certificate issued successfully",
      certificate: {
        id: cert._id,
        studentEmail: cert.studentEmail,
        studentName: cert.studentName,
        courseName: cert.courseName,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        uniqueId: cert.uniqueId,
        hash: cert.hash,
        pngUrl: `${baseUrl}/uploads/${path.basename(cert.imageLink)}`,
        pdfUrl: `${baseUrl}/uploads/${path.basename(cert.pdfLink)}`,
      }
    });

  } catch (err) {
    console.error("Certificate Issue Error:", err);
    res.status(500).json({ error: err.message });
  }
};
