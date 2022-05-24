#### NOTICE: The solidity code is unaudited and most likely broken as is. Do not use in production!

# MerkleTree.js MultiProof Solidity example

> Example of generating multiproofs with [MerkleTree.js](https://github.com/miguelmota/merkletreejs) and verifying in a [Solidity](https://github.com/ethereum/solidity) smart contract.

## Example

[`contracts/MerkleMultiProof.sol`](./contracts/MerkleMultiProof.sol)

```solidity
pragma solidity >=0.5.0 <0.7.0;

// @credit: https://github.com/status-im/account-contracts/blob/develop/contracts/cryptography/MerkleMultiProof.sol
contract MerkleMultiProof {
    function calculateMultiMerkleRoot(
        bytes32[] memory leafs,
        bytes32[] memory proofs,
        bool[] memory proofFlag
    ) public pure returns (bytes32 merkleRoot) {
        uint256 leafsLen = leafs.length;
        uint256 totalHashes = proofFlag.length;
        bytes32[] memory hashes = new bytes32[](totalHashes);
        uint leafPos = 0;
        uint hashPos = 0;
        uint proofPos = 0;
        for(uint256 i = 0; i < totalHashes; i++){
            hashes[i] = hashPair(
                proofFlag[i] ? (leafPos < leafsLen ? leafs[leafPos++] : hashes[hashPos++]) : proofs[proofPos++],
                leafPos < leafsLen ? leafs[leafPos++] : hashes[hashPos++]
            );
        }

        return hashes[totalHashes-1];
    }

    function hashPair(bytes32 a, bytes32 b) private pure returns(bytes32) {
        return a < b ? hash_node(a, b) : hash_node(b, a);
    }

    function hash_node(bytes32 left, bytes32 right) private pure returns (bytes32 hash) {
        assembly {
            mstore(0x00, left)
            mstore(0x20, right)
            hash := keccak256(0x00, 0x40)
        }
        return hash;
    }

    function verifyMultiProof(
        bytes32 root,
        bytes32[] memory leafs,
        bytes32[] memory proofs,
        bool[] memory proofFlag
    ) public pure returns (bool) {
        return calculateMultiMerkleRoot(leafs, proofs, proofFlag) == root;
    }
}
```

[`test/merkleMultiProof.test.js`](./test/merkleMultiProof.test.js)

```js
const MerkleMultiProof = artifacts.require('MerkleMultiProof')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

const contract = await MerkleMultiProof.new()

const leaves = ['a', 'b', 'c', 'd', 'e', 'f'].map(keccak256).sort(Buffer.compare)
const tree = new MerkleTree(leaves, keccak256, { sort: true })

const root = tree.getRoot()
const proofLeaves = ['b', 'f', 'd'].map(keccak256).sort(Buffer.compare)
const proof = tree.getMultiProof(proofLeaves)
const proofFlags = tree.getProofFlags(proofLeaves, proof)

const verified = await contract.verifyMultiProof.call(root, proofLeaves, proof, proofFlags)
console.log(verified) // true
```

## Test

```bash
npm test
```

## License

MIT
