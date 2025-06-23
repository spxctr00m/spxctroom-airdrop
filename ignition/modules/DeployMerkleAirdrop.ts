import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MERKLE_ROOT = process.env.MERKLE_ROOT!;
const SPX_TOKEN_ADDRESS = process.env.SPX_ADDRESS!;


const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {
  const airdrop = m.contract("MerkleAirdrop", [SPX_TOKEN_ADDRESS, MERKLE_ROOT]);

  return { airdrop };
});

export default MerkleAirdropModule;
