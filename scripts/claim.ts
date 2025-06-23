import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config();

// === Config ===
const RPC_URL = process.env.METIS_SEPOLIA_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const AIRDROP_ADDRESS = process.env.AIRDROP_ADDRESS!; 

// === Load Claim Data ===
const claims = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../data/claims.json"), "utf-8")
);

// === ABI ===
const AIRDROP_ABI = [
  "function claim(uint256 index, address account, uint256 amount, bytes32[] calldata proof) external",
];

// === Main ===
async function main() {
  const userAddress = process.argv[2];

  if (!userAddress) {
    console.error("❌ Please provide a wallet address as argument");
    console.error("Example: npx tsx scripts/claim.ts 0xYourAddress");
    process.exit(1);
  }

  const claim = claims[userAddress];

  if (!claim) {
    console.error("❌ No claim found for this address");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const airdrop = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);

  console.log(`📤 Sending claim for: ${userAddress}`);
  const tx = await airdrop.claim(claim.index, userAddress, claim.amount, claim.proof);
  console.log("⛓️  Tx submitted:", tx.hash);

  await tx.wait();
  console.log("✅ Claim successful!");
}

main().catch((err) => {
  console.error("❌ Error claiming airdrop:", err);
  process.exit(1);
});
