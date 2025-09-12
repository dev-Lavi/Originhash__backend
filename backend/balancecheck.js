import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
  const balance = await wallet.getBalance();
  console.log("Backend wallet address:", wallet.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
})();
