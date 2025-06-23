import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { MerkleTree } from "merkletreejs"; 
import keccak256 from "keccak256";
import { AbiCoder, getAddress } from "ethers";

// Define the structure of each airdrop entry
interface AirdropEntry {
  index: number;
  address: string;
  amount: string;
}

interface ClaimData {
  index: number;
  amount: string;
  proof: string[];
}

// Array to store parsed airdrop entries from CSV
const entries: AirdropEntry[] = [];

// Read the CSV file containing airdrop data
fs.createReadStream(path.resolve(__dirname, "../data/airdrop.csv"))
  .pipe(csv()) // Parse CSV row by row
  .on("data", (row) => {
    // Validate row: all fields must be present
    if (!row.index || !row.address || !row.amount) {
      console.warn("⚠️ Skipping invalid row:", row);
      return;
    }

    try {
      // Parse and normalize the fields
      const index = parseInt(row.index);
      const address = getAddress(row.address.trim()); // EIP-55 checksummed address
      const amount = row.amount.trim(); // Keep as string for encoding

      // Push valid entry into the entries array
      entries.push({ index, address, amount });
    } catch (err) {
      // Handle potential parsing or address formatting errors
      if (err instanceof Error) {
        console.warn("⚠️ Invalid data format in row:", row, err.message);
      } else {
        console.warn("⚠️ Invalid data format in row:", row, err);
      }
    }
  })
  .on("end", () => {
    // Initialize ABI encoder from ethers
    const abiCoder = new AbiCoder();

    // Convert each entry into a Merkle tree leaf by encoding and hashing it
   // ✅ DOUBLE HASHED
const leaves = entries.map(({ index, address, amount }) =>
  keccak256(
    keccak256(
      abiCoder.encode(["uint256", "address", "uint256"], [index, address, amount])
    )
  )
);


    console.log(`✅ ${leaves.length} Merkle leaves generated.`);

    // Create the Merkle tree with keccak256 and sorted pairs for Solidity compatibility
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    // Get the Merkle root to store on-chain
    const root = tree.getHexRoot();
    console.log("📌 Merkle Root:", root);

    fs.writeFileSync(
  path.resolve(__dirname, "../data/merkle-root.txt"),
  root.replace(/^0x/, "") // remove 0x so you can prepend it in test
);


    // Object to store each address's claim data (index, amount, proof)
    const claims: Record<string, ClaimData> = {};

    // Generate proofs for each address and store them
    entries.forEach(({ index, address, amount }) => {
      // Recompute the leaf for this entry
      const leaf = keccak256(
        keccak256(abiCoder.encode(
          ["uint256", "address", "uint256"],
          [index, address, amount]
        ))
      );

      // Generate Merkle proof for this leaf
      const proof = tree.getHexProof(leaf);

      // Warn if address appears more than once (could overwrite)
      if (claims[address]) {
        console.warn(`⚠️ Duplicate address detected: ${address}`);
      }

      // Store claim data in the output object
      claims[address] = { index, amount, proof };
    });

    // Write the claims object to a JSON file for use in frontend or smart contracts
    fs.writeFileSync(
      path.resolve(__dirname, "../data/claims.json"),
      JSON.stringify(claims, null, 2)
    );

    console.log("✅ claims.json written to /data/claims.json");
  });
