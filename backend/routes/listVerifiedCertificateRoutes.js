import express from "express";
import { protect } from "../middlewares/adminauthMiddleware.js"; 
import { verifySuperAdmin } from "../middlewares/verifySuperAdmin.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import {
  listVerifiedCertificatesByAdmin,
  listAllVerifiedCertificates,
} from "../controller/listVerifiedCertController.js";

const router = express.Router();

// ✅ Route for current admin → only his verified certificates
router.get("/my-verified", verifyAdmin, listVerifiedCertificatesByAdmin);

// ✅ Route for superadmin → all verified certificates
router.get("/all-verified", verifySuperAdmin, listAllVerifiedCertificates);

export default router;
