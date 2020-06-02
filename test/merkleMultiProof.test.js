const MerkleMultiProof = artifacts.require('MerkleMultiProof')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

contract('MerkleMultiProof', (accounts) => {
  let contract

  before('setup', async () => {
    contract = await MerkleMultiProof.new()
  })

  context('MerkleMultiProof', () => {
    describe('verifyMultiProof()', () => {
      it('should verify for valid merkle multiproof (example)', async () => {
        const leaves = ['a', 'b', 'c', 'd', 'e', 'f'].map(keccak256).sort(Buffer.compare)
        const tree = new MerkleTree(leaves, keccak256, { sort: true })

        const root = tree.getRoot()
        const proofLeaves = ['b', 'f', 'd'].map(keccak256).sort(Buffer.compare)
        const proof = tree.getMultiProof(proofLeaves)
        const proofFlags = tree.getProofFlags(proofLeaves, proof)

        const verified = await contract.verifyMultiProof.call(root, proofLeaves, proof, proofFlags)
        assert.equal(verified, true)
      })

      it('should not verify for invalid merkle multiproof', async () => {
        const leaves = ['a', 'b', 'c', 'd', 'e', 'f'].map(keccak256).sort(Buffer.compare)
        const tree = new MerkleTree(leaves, keccak256, { sort: true })

        const root = tree.getRoot()
        const proofLeaves = ['b', 'f', 'd'].map(keccak256).sort(Buffer.compare)
        const proof = tree.getMultiProof(proofLeaves)
        const proofFlags = tree.getProofFlags(proofLeaves, proof)
        proofFlags[proofFlags.length - 1] = !proofFlags[proofFlags.length - 1]

        let errMessage = ''
        try {
          await contract.verifyMultiProof.call(root, proofLeaves, proof, proofFlags)
        } catch (err) {
          errMessage = err.message
        }

        assert.equal(errMessage, 'Returned error: VM Exception while processing transaction: invalid opcode')
      })
    })
  })
})
