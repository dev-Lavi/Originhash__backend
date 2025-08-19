import { createCanvas, registerFont, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Register fonts
const fontDir = path.join(__dirname, "../assets/fonts");
registerFont(path.join(fontDir, "PlayfairDisplay-Bold.ttf"), { family: "Playfair" });
registerFont(path.join(fontDir, "OpenSans-Regular.ttf"), { family: "OpenSans" });

export const generateCertificate = async (details, preview = false) => {
  const { studentName, courseName, issueDate, expiryDate, uniqueId } = details;

  // Canvas size A4 landscape (96 DPI approx)
  const width = 1123;
  const height = 794;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // --- Background ---
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Left green section (triangle)
  ctx.fillStyle = "#2AB678";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width * 0.25, 0);
  ctx.lineTo(0, height * 0.35);
  ctx.closePath();
  ctx.fill();

  // --- Badge image ---
  const badgePath = path.join(__dirname, "../assets/badge.png");
  const badgeImg = await loadImage(badgePath);
  ctx.drawImage(badgeImg, 60, 60, 200, 200);

// --- Certificate Heading ---
ctx.fillStyle = "#1E6B4E"; // darker green
ctx.textAlign = "center";
ctx.font = "bold 50px OpenSans";
ctx.fillText("CERTIFICATE OF ACHIEVEMENT", width / 2, 280); // moved lower

// Horizontal separator
ctx.strokeStyle = "#1E6B4E";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(width / 2 - 300, 300);
ctx.lineTo(width / 2 + 300, 300);
ctx.stroke();

// Recipient Text
ctx.fillStyle = "#555";
ctx.font = "20px OpenSans";
ctx.fillText("THIS IS PRESENTED TO", width / 2, 350);

// Recipient name
ctx.fillStyle = "#2AB678";
ctx.font = "bold 65px Playfair";
ctx.fillText(studentName, width / 2, 430);

// Decorative underline under name
ctx.strokeStyle = "#2AB678";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(width / 2 - 200, 455);
ctx.lineTo(width / 2 + 200, 455);
ctx.stroke();

// Course Info
ctx.fillStyle = "#555";
ctx.font = "20px OpenSans";
ctx.fillText(
  `for exemplary performance in the ${courseName} course.`,
  width / 2,
  495
);

  // Signatures section
  ctx.strokeStyle = "#705CFF";
  ctx.lineWidth = 1.5;

  // Signature 1
  ctx.beginPath();
  ctx.moveTo(150, height - 150);
  ctx.lineTo(350, height - 150);
  ctx.stroke();
  ctx.fillStyle = "#2AB678";
  ctx.font = "bold 18px OpenSans";
  ctx.fillText("CRAZYCODERS", 250, height - 120);
  ctx.fillStyle = "#555";
  ctx.font = "16px OpenSans";
  ctx.fillText("Course Director", 250, height - 95);

  // Signature 2
  ctx.beginPath();
  ctx.moveTo(width - 350, height - 150);
  ctx.lineTo(width - 150, height - 150);
  ctx.stroke();
  ctx.fillStyle = "#2AB678";
  ctx.font = "bold 18px OpenSans";
  ctx.fillText("OriginHash", width - 250, height - 120);
  ctx.fillStyle = "#555";
  ctx.font = "16px OpenSans";
  ctx.fillText("CEO & Founder", width - 250, height - 95);

const expiryDateText = expiryDate
  ? `Valid until: ${new Date(expiryDate).toDateString()}`
  : "Valid until: None";

  // Dates & ID (bottom center)
  ctx.fillStyle = "#555";
  ctx.font = "14px OpenSans";
  ctx.textAlign = "center";
  ctx.fillText(`Issued on: ${new Date(issueDate).toDateString()}`, width / 2, height - 80);
  ctx.fillText(`Valid until: ${expiryDateText}`, width / 2, height - 55);
  ctx.font = "12px OpenSans";
  ctx.fillText(`Certificate ID: ${uniqueId}`, width / 2, height - 35);

  // ✅ Ensure uploads folder exists
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // --- Save PNG ---
  const pngFile = preview ? `preview-${Date.now()}.png` : `cert-${uniqueId}.png`;
  const pngPath = path.join(uploadDir, pngFile);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(pngPath, buffer);

  // --- Save PDF ---
  const pdfFile = pngFile.replace(".png", ".pdf");
  const pdfPath = path.join(uploadDir, pdfFile);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape" });
    const stream = fs.createWriteStream(pdfPath);

    stream.on("finish", resolve);
    stream.on("error", reject);

    doc.pipe(stream);
    doc.image(buffer, 0, 0, { width: 842, height: 595 });
    doc.end();
  });

  return {
    success: true,
    message: "Certificate generated successfully",
    pngPath,
    pdfPath,
    buffer,
  };
};
