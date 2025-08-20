import express from "express";
import { protect } from "../middlewares/adminauthMiddleware.js"; 
import { verifySuperAdmin } from "../middlewares/verifySuperAdmin.js";
import { listMyCertificates, listAllCertificates } from "../controller/listCertController.js";

const router = express.Router();

// Admin: Get certificates issued by current admin
router.get("/my-issued", protect, listMyCertificates);

// SuperAdmin: Get all issued certificates
router.get("/all", verifySuperAdmin, listAllCertificates);

export default router;
