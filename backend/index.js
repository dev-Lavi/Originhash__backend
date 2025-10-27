import express from "express";
import dotenv from "dotenv";
import db from "./utils/db.js";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";


import "./config/passport.js" // Import passport configuration

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import all routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/adminRoutes.js";
import verifyCertRoutes from "./routes/verifyCertRoutes.js";
import listCertificateRoutes from "./routes/listCertificateRoutes.js";
import listVerifiedCertificateRoutes from "./routes/listVerifiedCertificateRoutes.js";
import headerRegionRoutes from './routes/headerRegionRoutes.js';
import footerRegionRoutes from './routes/footerRegionRoutes.js';
import coreMenuRoutes from './routes/coreMenuRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import userSectionRoutes from "./routes/userSectionRoutes.js";
import companyInfoRoutes from './routes/companyInfoRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

import certRoutes from "./routes/certRoutes.js";

// app.use(cors({
//   origin: "https://origin-hash.vercel.app",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
// }));

app.use(express.json());

// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://originhash.vercel.app","https://origin-hash-new.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // ✅ allow cookies + auth headers
  })
);


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Passport middlewares
app.use(passport.initialize());
app.use(passport.session());

// connect to MongoDB
db();

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




app.use("/api/v1/users", userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use("/api/v1/certs", certRoutes);
app.use("/api/v1/cert", verifyCertRoutes);
app.use("/api/v1/certificates", listCertificateRoutes);
app.use("/api/v1/certificates", listVerifiedCertificateRoutes);
app.use('/api/header', headerRegionRoutes);
app.use('/api/footer-region', footerRegionRoutes);
app.use('/api/core-menu', coreMenuRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/usersection', userSectionRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
