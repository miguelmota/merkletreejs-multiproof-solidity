pragma solidity >=0.5.0 <0.7.0;

/**
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * @notice based on https://github.com/ethereum/eth2.0-specs/blob/dev/ssz/merkle-proofs.md#merkle-multiproofs but without generalized indexes
 */
contract MerkleMultiProof {

   /**
     * @notice Calculates a merkle root using multiple leafs at same time
     * @param leafs out of order sequence of leafs and it's siblings
     * @param proofs out of order sequence of parent proofs
     * @param proofFlag flags for using or not proofs while hashing against hashes.
     * @return merkleRoot of tree
     */
    function calculateMultiMerkleRoot(
        bytes32[] memory leafs,
        bytes32[] memory proofs,
        bool[] memory proofFlag
    )
        public
        pure
        returns (bytes32 merkleRoot)
    {
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

    function hashPair(bytes32 a, bytes32 b) private pure returns(bytes32){
        return a < b ? hash_node(a, b) : hash_node(b, a);
    }

    function hash_node(bytes32 left, bytes32 right)
        private pure
        returns (bytes32 hash)
    {
        assembly {
            mstore(0x00, left)
            mstore(0x20, right)
            hash := keccak256(0x00, 0x40)
        }
        return hash;
    }

    /**
     * @notice Check validity of multimerkle proof
     * @param root merkle root
     * @param leafs out of order sequence of leafs and it's siblings
     * @param proofs out of order sequence of parent proofs
     * @param proofFlag flags for using or not proofs while hashing against hashes.
     */
    function verifyMultiProof(
        bytes32 root,
        bytes32[] memory leafs,
        bytes32[] memory proofs,
        bool[] memory proofFlag
    )
        public
        pure
        returns (bool)
    {
        return calculateMultiMerkleRoot(leafs, proofs, proofFlag) == root;
    }

}
