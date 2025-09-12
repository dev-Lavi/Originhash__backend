import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const PINATA_API_KEY = process.env.API_Key_pinata;
const PINATA_SECRET_API_KEY = process.env.API_Secret_pinata;
const PINATA_JWT = process.env.JWT_pinata;

class PinataService {
  constructor() {
    this.baseURL = 'https://api.pinata.cloud';
    
    // Check if we have required credentials
    if (!PINATA_API_KEY && !PINATA_JWT) {
      console.warn('⚠️ Warning: No Pinata credentials found in environment variables');
    }
  }

  // 📤 Upload file buffer to IPFS (for PDFs, images, etc.)
  async uploadFileToIPFS(fileBuffer, fileName, options = {}) {
    try {
      console.log(`📁 Uploading ${fileName} to IPFS via Pinata...`);

      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: this.getContentType(fileName)
      });

      // Add metadata if provided
      const metadata = {
        name: fileName,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          ...options.metadata
        }
      };

      formData.append('pinataMetadata', JSON.stringify(metadata));

      // Pinata options
      const pinataOptions = {
        cidVersion: 1,
        ...options.pinataOptions
      };
      
      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      // Choose authentication method
      const headers = {
        ...formData.getHeaders(),
        ...(this.getAuthHeaders())
      };

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers,
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      console.log('✅ File uploaded successfully to IPFS');
      console.log(`📋 IPFS Hash: ${response.data.IpfsHash}`);

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        ipfsUrl: `ipfs://${response.data.IpfsHash}`
      };

    } catch (error) {
      console.error('❌ Error uploading file to Pinata:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        details: error.response?.data
      };
    }
  }

  // 📝 Upload JSON data to IPFS (for metadata)
  async uploadJSONToIPFS(jsonData, name = 'metadata.json') {
    try {
      console.log(`📝 Uploading JSON data to IPFS: ${name}`);

      const data = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: name,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
            type: 'json'
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          }
        }
      );

      console.log('✅ JSON uploaded successfully to IPFS');
      console.log(`📋 IPFS Hash: ${response.data.IpfsHash}`);

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        ipfsUrl: `ipfs://${response.data.IpfsHash}`
      };

    } catch (error) {
      console.error('❌ Error uploading JSON to Pinata:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // 📋 Get list of pinned files
  async getPinnedFiles(limit = 10) {
    try {
      const response = await axios.get(
        `${this.baseURL}/data/pinList?pageLimit=${limit}&status=pinned`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return {
        success: true,
        files: response.data.rows,
        count: response.data.count
      };

    } catch (error) {
      console.error('❌ Error fetching pinned files:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // 🗑️ Unpin file from IPFS (remove from Pinata)
  async unpinFile(ipfsHash) {
    try {
      await axios.delete(
        `${this.baseURL}/pinning/unpin/${ipfsHash}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      console.log(`🗑️ File unpinned: ${ipfsHash}`);
      
      return {
        success: true,
        message: 'File unpinned successfully'
      };

    } catch (error) {
      console.error('❌ Error unpinning file:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // 🔐 Get authentication headers
  getAuthHeaders() {
    if (PINATA_JWT) {
      return {
        'Authorization': `Bearer ${PINATA_JWT}`
      };
    } else if (PINATA_API_KEY && PINATA_SECRET_API_KEY) {
      return {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      };
    } else {
      throw new Error('No Pinata authentication credentials found');
    }
  }

  // 📄 Get content type based on file extension
  getContentType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const contentTypes = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'txt': 'text/plain',
      'json': 'application/json',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript'
    };

    return contentTypes[extension] || 'application/octet-stream';
  }

  // 🧪 Test connection to Pinata
  async testConnection() {
    try {
      const response = await axios.get(
        `${this.baseURL}/data/testAuthentication`,
        {
          headers: this.getAuthHeaders()
        }
      );

      console.log('✅ Pinata connection successful');
      console.log(`📋 Message: ${response.data.message}`);
      
      return {
        success: true,
        message: response.data.message
      };

    } catch (error) {
      console.error('❌ Pinata connection failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

export default new PinataService();
