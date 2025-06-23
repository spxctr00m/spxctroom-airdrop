// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    address public immutable token;
    bytes32 public immutable merkleRoot;

    // Bitmap to track claimed indexes
    mapping(uint256 => uint256) private claimedBitMap;

    event Claimed(
        uint256 indexed index,
        address indexed account,
        uint256 amount
    );

    constructor(address _token, bytes32 _merkleRoot) {
        token = _token;
        merkleRoot = _merkleRoot;
    }

    function isClaimed(uint256 index) public view returns (bool) {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        uint256 word = claimedBitMap[wordIndex];
        uint256 mask = (1 << bitIndex);
        return word & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        claimedBitMap[wordIndex] |= (1 << bitIndex);
    }

    function claim(
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        require(!isClaimed(index), "Already claimed");

        // Create the leaf hash using abi.encode
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(index, account, amount)))
        );

        // Verify the proof
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid Merkle Proof"
        );

        // Mark as claimed
        _setClaimed(index);

        // Transfer tokens
        require(
            IERC20(token).transfer(account, amount),
            "Token transfer failed"
        );

        emit Claimed(index, account, amount);
    }
}
