# 🪂 SPXCTROOM Merkle Airdrop

This project implements a secure, gas-efficient Merkle airdrop system for distributing SPX tokens on the Metis Sepolia testnet.

## 📦 Features

- ✅ ERC20 token (`SPX`) with minting and ownership control
- ✅ Merkle Tree–based airdrop to efficiently verify large claim sets
- ✅ Claim tracking using bitmap for low gas usage
- ✅ Claim proofs generated from CSV using `merkletreejs` + `ethers`
- ✅ Test suite using Mocha + Chai (with negative and positive test cases)
- ✅ Hardhat + TypeScript setup with Ignition deployment support
- 🔜 Next phase: ZK circuit for dynamic eligibility (based on wallet actions or holdings)

---

## 📁 Project Structure

```
.
├── contracts/
│   ├── SpxctroomToken.sol         # SPX token (ERC20, mintable, burnable, ownable)
│   └── MerkleAirdrop.sol          # Merkle-based airdrop claim contract
├── scripts/
│   ├── generateMerkleTree.ts      # CSV → Merkle root + proofs
│   └── (claim.ts)                 # (Coming soon) CLI tool to submit claims
├── data/
│   ├── airdrop.csv                # Raw wallet addresses and amounts
│   ├── claims.json                # Final JSON of address → index, amount, proof
│   └── merkle-root.txt            # Merkle root string to deploy with
├── test/
│   └── MerkleAirdrop.test.ts      # Unit tests for valid + invalid claims
├── hardhat.config.ts              # Hardhat setup for TypeScript, Ignition
└── tsconfig.json
```

---

## 📚 Setup & Usage

### 1. 📦 Install dependencies

```bash
npm install
```

### 2. ✍️ Add `.env` file

```env
PRIVATE_KEY=your_testnet_wallet_private_key
METIS_SEPOLIA_RPC_URL=https://sepolia.metisdevops.link/YOUR_PROJECT_ID
```

---

## 🧮 Merkle Tree Generation

1. Edit `data/airdrop.csv` with the format:
```
index,address,amount
0,0xAbC123...,100000000000000000000
1,0xDef456...,50000000000000000000
...
```

2. Run the script:

```bash
npx tsx scripts/generateMerkleTree.ts
```

This will output:
- `claims.json`
- `merkle-root.txt` (used in deployment)

---

## 🚀 Deploying with Ignition

Make sure you have a `deploy.ts` script using Hardhat Ignition.

Then run:

```bash
npx hardhat ignition deploy ignition/modules/MerkleAirdrop.ts --network metisSepolia
```

---

## 🧪 Testing

```bash
npx hardhat test
```

Includes:
- ✅ Valid claim
- 🚫 Repeated claim
- 🚫 Invalid proof

---

## 🌐 Claiming from Block Explorer

1. Go to the verified `MerkleAirdrop` contract
2. Connect wallet
3. Use the `claim()` function with data from `claims.json`

---

## 🛠 Technologies Used

- Solidity (v0.8.27)
- Hardhat + TypeScript
- OpenZeppelin Contracts v5
- Ethers.js
- MerkleTreeJS
- Chai & Mocha (testing)

---

## 🧠 Next Phase: ZK Circuit Add-on

In the next phase, we will integrate a ZK proof system that dynamically makes wallets eligible based on:
- ✅ Holding testnet tokens (e.g. 0.05 METIS)
- ✅ Completing off-chain tasks (e.g. following a Twitter account)

ZK proofs will award "points" that can be proven without revealing the user's entire wallet activity.

---

## 📄 License

[MIT License](LICENSE)
