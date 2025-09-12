import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract Configuration
const CONTRACT_ADDRESS = "0x84f42664d74d5973323781c7fd207f5b618b31eb"; // From Remix
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_issuer",
				"type": "address"
			}
		],
		"name": "addAuthorizedIssuer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_issuer",
				"type": "address"
			}
		],
		"name": "removeAuthorizedIssuer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_mongoHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			}
		],
		"name": "storeCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "mongoHash",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "issuer",
				"type": "address"
			}
		],
		"name": "CertificateStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "authorizedIssuers",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "certificateExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "certificates",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_mongoHash",
				"type": "string"
			}
		],
		"name": "getCertificateIPFS",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_mongoHash",
				"type": "string"
			}
		],
		"name": "verifyCertificate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]


class BlockchainService {
  constructor() {
    // Connect to Sepolia network
    this.provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
  }

  // Store certificate hash on blockchain
  async storeCertificateOnBlockchain(mongoHash, ipfsHash) {
    try {
      console.log(`Storing certificate: ${mongoHash} -> ${ipfsHash}`);
      
      // Call smart contract function
      const transaction = await this.contract.storeCertificate(mongoHash, ipfsHash);
      
      // Wait for transaction confirmation
      const receipt = await transaction.wait();
      
      console.log('Certificate stored on blockchain:', receipt.transactionHash);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error storing certificate on blockchain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify certificate exists on blockchain
  async verifyCertificateOnBlockchain(mongoHash) {
    try {
      const [exists, ipfsHash] = await this.contract.verifyCertificate(mongoHash);
      
      return {
        success: true,
        exists: exists,
        ipfsHash: ipfsHash,
        mongoHash: mongoHash
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get IPFS hash from blockchain
  async getIPFSHashFromBlockchain(mongoHash) {
    try {
      const ipfsHash = await this.contract.getCertificateIPFS(mongoHash);
      return {
        success: true,
        ipfsHash: ipfsHash
      };
    } catch (error) {
      console.error('Error getting IPFS hash:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const blockchainService = new BlockchainService();

export default blockchainService;
