import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

interface ClaimData {
  index: number;
  amount: string;
  proof: string[];
}

describe("MerkleAirdrop", function () {
  let spxToken: any;
  let airdrop: any;

  const claimsPath = path.resolve(__dirname, "../data/claims.json");
  const claims: Record<string, ClaimData> = JSON.parse(fs.readFileSync(claimsPath, "utf8"));
  const merkleRoot = "0x" + fs.readFileSync(path.resolve(__dirname, "../data/merkle-root.txt"), "utf8").trim();

  const testAddress = Object.keys(claims)[0];
  const { index, amount, proof } = claims[testAddress];

  beforeEach(async function () {
    const [owner, recipient] = await ethers.getSigners();

    const SPX = await ethers.getContractFactory("Spxctroom");
    spxToken = await SPX.deploy(recipient.address, owner.address);
    await spxToken.waitForDeployment();

    const Airdrop = await ethers.getContractFactory("MerkleAirdrop");
    airdrop = await Airdrop.deploy(await spxToken.getAddress(), merkleRoot);
    await airdrop.waitForDeployment();

    await spxToken.mint(airdrop.getAddress(), amount);
  });

  it("allows eligible user to claim tokens", async function () {
    await airdrop.claim(index, testAddress, amount, proof);
    const balance = await spxToken.balanceOf(testAddress);
    expect(balance.toString()).to.equal(amount);
  });

  it("reverts if already claimed", async function () {
    await airdrop.claim(index, testAddress, amount, proof);
    await expect(
      airdrop.claim(index, testAddress, amount, proof)
    ).to.be.revertedWith("Already claimed");
  });
});
