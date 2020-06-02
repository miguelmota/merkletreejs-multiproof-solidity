const MerkleMultiProof = artifacts.require('./MerkleMultiProof.sol')

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(MerkleMultiProof)
  })
}
