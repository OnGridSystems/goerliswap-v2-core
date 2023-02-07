module.exports = async function({ ethers, getNamedAccounts, deployments }) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const initialSupply = ethers.utils.parseEther('10000')

  const name = 'Token5'
  const symbol = 'TKN'

  token = await deploy('Token5', {
    from: deployer,
    log: true,
    args: [name, symbol, initialSupply],
    skipIfAlreadyDeployed: true
  })

  console.log('Token address:', token.address)
}

module.exports.tags = ['Token5']
