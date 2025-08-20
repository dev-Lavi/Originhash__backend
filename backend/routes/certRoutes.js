import express from "express";
import { previewCertificate, issueCertificate } from "../controller/certController.js";
import { protect } from "../middlewares/adminauthMiddleware.js";

const router = express.Router();

router.post("/preview", protect, previewCertificate);
router.post("/issue", protect, issueCertificate);

export default router;
