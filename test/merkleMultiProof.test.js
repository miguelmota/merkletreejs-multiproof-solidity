const MerkleMultiProof = artifacts.require('MerkleMultiProof')
const { MerkleTree } = require('../../merkletreejs')
const keccak256 = require('keccak256')

contract('MerkleMultiProof', (accounts) => {
  let contract

  before('setup', async () => {
    contract = await MerkleMultiProof.new()
  })

  context('MerkleMultiProof', () => {
    describe('verifyMultiProof()', () => {
      it('should verify for valid merkle multiproof (example)', async () => {
        const elements = ['a', 'b', 'c', 'd', 'e', 'f'].map(keccak256).sort(Buffer.compare)
        const tree = new MerkleTree(elements, keccak256, { sort: true })
        const leaves = ['b', 'f', 'd'].map(keccak256).sort(Buffer.compare)
        const root = tree.getRoot()
        const proof = tree.getMultiProof(leaves)
        const proofFlags = tree.getProofFlags(leaves, proof)

        assert.equal(await contract.verifyMultiProof.call(root, leaves, proof, proofFlags), true)
      })

      it('should not verify for invalid merkle multiproof', async () => {
        const elements = ['a', 'b', 'c', 'd', 'e', 'f'].map(keccak256).sort(Buffer.compare)
        const tree = new MerkleTree(elements, keccak256, { sort: true })
        const leaves = ['b', 'f', 'd'].map(keccak256).sort(Buffer.compare)
        const root = tree.getRoot()
        const proof = tree.getMultiProof(leaves)
        const proofFlags = tree.getProofFlags(leaves, proof)
        proofFlags[proofFlags.length - 1] = !proofFlags[proofFlags.length - 1]

        let errMessage = ''
        try {
          await contract.verifyMultiProof.call(root, leaves, proof, proofFlags)
        } catch (err) {
          errMessage = err.message
        }

        assert.equal(errMessage, 'Returned error: VM Exception while processing transaction: invalid opcode')
      })
    })
  })
})
