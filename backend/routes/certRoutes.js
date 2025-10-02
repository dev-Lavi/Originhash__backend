import express from "express";
import { previewCertificate, issueCertificate } from "../controller/certController.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/preview", verifyAdmin, previewCertificate);
router.post("/issue", verifyAdmin, issueCertificate);

export default router;
