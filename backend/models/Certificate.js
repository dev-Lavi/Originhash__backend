import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    issuerAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentEmail: { type: String, required: true },
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: false },
    uniqueId: { type: String, required: true, unique: true },
    hash: { type: String, required: true },

    // ✅ Local file storage (existing)
    imageLink: { type: String }, // PNG path (preview or quick view)
    pdfLink: { type: String },   // PDF path (official certificate)

    verified: { type: Boolean, default: false },

    // ✅ Payment details (dummy storage - not secure for production)
    paymentDetails: {
      cardNumber: { type: String },    // In production, only store last 4 digits
      expiryMonth: { type: String },
      expiryYear: { type: String },
      cvCode: { type: String },
      paymentDate: { type: Date }      // When payment was processed
    },

    // 🚀 IPFS Storage Fields
    ipfsHash: { 
      type: String,
      index: true  // Index for faster queries
    },                    // Primary IPFS hash (used for blockchain)
    
    pdfIpfsHash: { type: String },      // PDF file specific IPFS hash
    pngIpfsHash: { type: String },      // PNG file specific IPFS hash
    
    pdfGatewayUrl: { type: String },    // Direct Pinata gateway URL for PDF
    pngGatewayUrl: { type: String },    // Direct Pinata gateway URL for PNG
    
    ipfsUploadDate: { type: Date },     // When files were uploaded to IPFS
    ipfsUploadStatus: { 
      type: String, 
      enum: ['pending', 'success', 'failed', 'partial'],
      default: 'pending'
    },
    ipfsError: { type: String },        // Error message if IPFS upload fails

    // ⛓️ Blockchain Storage Fields
    blockchainVerified: { 
      type: Boolean, 
      default: false,
      index: true  // Index for faster blockchain verification queries
    },
    
    blockchainTxHash: { 
      type: String,
      index: true  // Index for transaction lookups
    },               // Ethereum transaction hash
    
    blockNumber: { type: String },      // Block number where transaction was mined
    gasUsed: { type: String },         // Gas used for the transaction
    blockchainError: { type: String }, // Error message if blockchain storage fails
    
    mongoHash: { 
      type: String,
      index: true  // This will be the _id.toString() for blockchain queries
    },

    // 📊 Processing Status Fields
    processedAt: { type: Date },        // When IPFS + blockchain processing completed
    processingStatus: {
      type: String,
      enum: ['not_processed', 'processing', 'completed', 'failed'],
      default: 'not_processed'
    },
    
    // 🔍 Verification Tracking
    verificationAttempts: { type: Number, default: 0 },
    lastVerificationDate: { type: Date },
    
    // 📱 Access Tracking
    accessCount: { type: Number, default: 0 },        // How many times certificate was viewed
    lastAccessDate: { type: Date },                   // Last time certificate was accessed
    
    // 🏷️ Additional Metadata
    metadata: {
      fileSize: { type: Number },      // Original file size in bytes
      pdfSize: { type: Number },       // PDF file size
      pngSize: { type: Number },       // PNG file size
      ipfsSize: { type: Number },      // Total IPFS storage used
      version: { type: String, default: '1.0' }  // Schema version for migrations
    }
  },
  { 
    timestamps: true,  // Adds createdAt and updatedAt automatically
    
    // Add indexes for better query performance
    indexes: [
      { uniqueId: 1 },           // Unique index
      { studentEmail: 1 },       // Student lookup
      { blockchainTxHash: 1 },   // Blockchain transaction lookup
      { ipfsHash: 1 },          // IPFS hash lookup
      { verified: 1, blockchainVerified: 1 },  // Verification status queries
      { issuerAdminId: 1, createdAt: -1 }      // Admin certificates list
    ]
  }
);

// 📋 Add methods to the schema
certificateSchema.methods.toPublicJSON = function() {
  return {
    uniqueId: this.uniqueId,
    studentName: this.studentName,
    courseName: this.courseName,
    issueDate: this.issueDate,
    expiryDate: this.expiryDate,
    verified: this.verified,
    blockchainVerified: this.blockchainVerified,
    ipfsHash: this.ipfsHash,
    pdfGatewayUrl: this.pdfGatewayUrl,
    pngGatewayUrl: this.pngGatewayUrl,
    blockchainTxHash: this.blockchainTxHash,
    mongoHash: this.mongoHash
  };
};

// 🔍 Method to check if certificate is fully processed
certificateSchema.methods.isFullyProcessed = function() {
  return this.verified && 
         this.blockchainVerified && 
         this.ipfsHash && 
         this.processingStatus === 'completed';
};

// 📊 Method to get processing summary
certificateSchema.methods.getProcessingSummary = function() {
  return {
    verified: this.verified,
    ipfsUploaded: !!this.ipfsHash,
    blockchainStored: this.blockchainVerified,
    fullyProcessed: this.isFullyProcessed(),
    processingStatus: this.processingStatus,
    lastUpdated: this.updatedAt
  };
};

// 🎯 Static method to find certificates by blockchain status
certificateSchema.statics.findByBlockchainStatus = function(verified = true) {
  return this.find({ blockchainVerified: verified });
};

// 🔎 Static method to find by IPFS hash
certificateSchema.statics.findByIPFS = function(ipfsHash) {
  return this.findOne({ 
    $or: [
      { ipfsHash: ipfsHash },
      { pdfIpfsHash: ipfsHash },
      { pngIpfsHash: ipfsHash }
    ]
  });
};

// ⏰ Pre-save middleware to update mongoHash
certificateSchema.pre('save', function(next) {
  if (this.isNew || !this.mongoHash) {
    this.mongoHash = this._id.toString();
  }
  next();
});

export default mongoose.model("Certificate", certificateSchema);
