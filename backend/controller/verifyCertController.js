import Certificate from "../models/Certificate.js";
import path from "path";
import fs from "fs";
import pinataService from "../services/pinataService.js";
import blockchainService from "../services/blockchainService.js";

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

// ✅ Step 2: After dummy payment → upload to IPFS → store on blockchain
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
      console.log(`💳 Payment successful for certificate: ${uniqueId}`);

      // 3️⃣ Mark as verified
      cert.verified = true;

      // 4️⃣ Save payment details (dummy - mask sensitive data!)
      cert.paymentDetails = {
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
        expiryMonth,
        expiryYear,
        paymentDate: new Date().toISOString()
      };

      // 🚀 5️⃣ UPLOAD CERTIFICATE FILES TO IPFS
      console.log(`📤 Starting IPFS upload for certificate: ${uniqueId}`);
      
      let pdfIpfsHash = null;
      let pngIpfsHash = null;

      try {
        // Upload PDF to IPFS if exists
        if (cert.pdfLink) {
          const pdfPath = cert.pdfLink;
          if (fs.existsSync(pdfPath)) {
            console.log(`📄 Uploading PDF to IPFS: ${pdfPath}`);
            
            const pdfBuffer = fs.readFileSync(pdfPath);
            const pdfResult = await pinataService.uploadFileToIPFS(
              pdfBuffer, 
              `${cert.studentName}_${cert.uniqueId}_certificate.pdf`,
              {
                metadata: {
                  type: 'certificate-pdf',
                  studentName: cert.studentName,
                  courseName: cert.courseName,
                  uniqueId: cert.uniqueId,
                  uploadedAt: new Date().toISOString()
                }
              }
            );

            if (pdfResult.success) {
              pdfIpfsHash = pdfResult.ipfsHash;
              cert.pdfIpfsHash = pdfIpfsHash;
              cert.pdfGatewayUrl = pdfResult.gatewayUrl;
              console.log(`✅ PDF uploaded to IPFS: ${pdfIpfsHash}`);
            } else {
              console.warn(`⚠️ PDF upload failed: ${pdfResult.error}`);
            }
          }
        }

        // Upload PNG to IPFS if exists
        if (cert.imageLink) {
          const pngPath = cert.imageLink;
          if (fs.existsSync(pngPath)) {
            console.log(`🖼️ Uploading PNG to IPFS: ${pngPath}`);
            
            const pngBuffer = fs.readFileSync(pngPath);
            const pngResult = await pinataService.uploadFileToIPFS(
              pngBuffer, 
              `${cert.studentName}_${cert.uniqueId}_certificate.png`,
              {
                metadata: {
                  type: 'certificate-image',
                  studentName: cert.studentName,
                  courseName: cert.courseName,
                  uniqueId: cert.uniqueId,
                  uploadedAt: new Date().toISOString()
                }
              }
            );

            if (pngResult.success) {
              pngIpfsHash = pngResult.ipfsHash;
              cert.pngIpfsHash = pngIpfsHash;
              cert.pngGatewayUrl = pngResult.gatewayUrl;
              console.log(`✅ PNG uploaded to IPFS: ${pngIpfsHash}`);
            } else {
              console.warn(`⚠️ PNG upload failed: ${pngResult.error}`);
            }
          }
        }

        // Use PDF IPFS hash as primary, fallback to PNG
        const primaryIpfsHash = pdfIpfsHash || pngIpfsHash;
        
        if (!primaryIpfsHash) {
          throw new Error('No files were successfully uploaded to IPFS');
        }

        cert.ipfsHash = primaryIpfsHash; // Store primary IPFS hash

      } catch (ipfsError) {
        console.error(`❌ IPFS upload error: ${ipfsError.message}`);
        return res.status(500).json({
          success: false,
          message: "Payment successful but IPFS upload failed",
          error: ipfsError.message
        });
      }

      // 🔗 6️⃣ STORE ON BLOCKCHAIN
      console.log(`⛓️ Storing certificate hashes on blockchain...`);
      
      try {
        const mongoHash = cert._id.toString();
        const ipfsHash = cert.ipfsHash;

        console.log(`📝 MongoDB Hash: ${mongoHash}`);
        console.log(`📝 IPFS Hash: ${ipfsHash}`);

        const blockchainResult = await blockchainService.storeCertificateOnBlockchain(
          mongoHash, 
          ipfsHash
        );

        if (blockchainResult.success) {
          cert.blockchainTxHash = blockchainResult.transactionHash;
          cert.blockchainVerified = true;
          cert.blockNumber = blockchainResult.blockNumber;
          cert.gasUsed = blockchainResult.gasUsed;
          
          console.log(`✅ Certificate stored on blockchain:`);
          console.log(`   📋 Transaction: ${blockchainResult.transactionHash}`);
          console.log(`   📦 Block: ${blockchainResult.blockNumber}`);
          console.log(`   ⛽ Gas Used: ${blockchainResult.gasUsed}`);
        } else {
          console.warn(`⚠️ Blockchain storage failed: ${blockchainResult.error}`);
          cert.blockchainVerified = false;
          cert.blockchainError = blockchainResult.error;
          // Continue with process even if blockchain fails
        }

      } catch (blockchainError) {
        console.error(`❌ Blockchain error: ${blockchainError.message}`);
        cert.blockchainVerified = false;
        cert.blockchainError = blockchainError.message;
      }

      // 💾 7️⃣ SAVE UPDATED CERTIFICATE TO DATABASE
      cert.processedAt = new Date();
      await cert.save();

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // 📤 8️⃣ RETURN SUCCESS RESPONSE
      return res.json({
        success: true,
        message: "Payment successful. Certificate verified, uploaded to IPFS, and stored on blockchain.",
        cert: {
          // Basic Info
          studentName: cert.studentName,
          courseName: cert.courseName,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          uniqueId: cert.uniqueId,
          verified: cert.verified,
          
          // IPFS Data
          ipfsHash: cert.ipfsHash,
          pdfIpfsHash: cert.pdfIpfsHash,
          pngIpfsHash: cert.pngIpfsHash,
          
          // IPFS URLs
          pdfGatewayUrl: cert.pdfGatewayUrl,
          pngGatewayUrl: cert.pngGatewayUrl,
          
          // Blockchain Data
          blockchainVerified: cert.blockchainVerified,
          blockchainTxHash: cert.blockchainTxHash,
          blockNumber: cert.blockNumber,
          mongoHash: cert._id.toString(),
          
          // Legacy URLs (for backwards compatibility)
          pngUrl: cert.imageLink ? `${baseUrl}/uploads/${path.basename(cert.imageLink)}` : null,
          pdfUrl: cert.pdfLink ? `${baseUrl}/uploads/${path.basename(cert.pdfLink)}` : null,
        },
      });

    } else {
      return res.status(400).json({ success: false, message: "Payment failed" });
    }
  } catch (err) {
    console.error(`❌ Error in confirmPaymentAndVerify: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔍 New function to get blockchain verification status
export const getBlockchainStatus = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const cert = await Certificate.findOne({ uniqueId });
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    const mongoHash = cert._id.toString();
    const blockchainResult = await blockchainService.verifyCertificateOnBlockchain(mongoHash);

    res.json({
      success: true,
      uniqueId: cert.uniqueId,
      mongoHash: mongoHash,
      databaseIPFS: cert.ipfsHash,
      blockchainVerified: blockchainResult.exists,
      blockchainIPFS: blockchainResult.ipfsHash,
      hashesMatch: cert.ipfsHash === blockchainResult.ipfsHash,
      transactionHash: cert.blockchainTxHash
    });

  } catch (err) {
    console.error(`❌ Error getting blockchain status: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};
