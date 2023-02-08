const { task } = require('hardhat/config')
const fs = require('fs')

async function addLiquidity(router, token1, token2, amount1, amount2, user) {
  const approve1 = await token1.connect(user).approve(router.address, amount1)
  const tx1 = await approve1.wait()
  console.log('Approve token1 tx:', tx1.transactionHash)
  const approve2 = await token2.connect(user).approve(router.address, amount2)
  const tx2 = await approve2.wait()
  console.log('Approve token2 tx:', tx2.transactionHash)
  const liquidity = await router
    .connect(user)
    .addLiquidity(token1.address, token2.address, amount1, amount2, 1, 1, user.address, Date.now())
  return liquidity
}

async function addLiquidityETH(router, token, amount, amountETH, user) {
  const approve = await token.connect(user).approve(router.address, amount)
  const tx = await approve.wait()
  console.log('Approve tx:', tx.transactionHash)
  const liquidity = await router
    .connect(user)
    .addLiquidityETH(token.address, amount, 1, 1, user.address, Date.now(), { value: amountETH })
  return liquidity
}

async function getPairAddress(factory, token1, token2) {
  const pair = await factory.getPair(token1, token2)
  return pair
}

task('add-liquidity', 'Add liquidity').setAction(async (taskArgs, hre) => {
  const provider = new hre.ethers.providers.JsonRpcProvider('http://localhost:8545/')
  const routerAddress = '0xb3Ed9Fc48C9A495177a5aB31ea5cdA419cC6EaA1'

  const abi = JSON.parse(fs.readFileSync('./abi/UniswapV2Router02.json', 'utf8'))
  const routerContractInstance = new hre.ethers.Contract(routerAddress, abi, provider)
  const factoryArtifact = await hre.deployments.get('UniswapV2Factory')
  const factoryContractInstance = await hre.ethers.getContractAt(factoryArtifact.abi, factoryArtifact.address)
  const wethAddress = await routerContractInstance.WETH()

  const amount = hre.ethers.utils.parseEther('1')
  const token1Artifact = await hre.deployments.get('Token4')
  const token1 = await hre.ethers.getContractAt(token1Artifact.abi, token1Artifact.address)
  const token2Artifact = await hre.deployments.get('Token5')
  const token2 = await hre.ethers.getContractAt(token2Artifact.abi, token2Artifact.address)
  const signers = await hre.ethers.getSigners()
  const user = signers[0]

  const artifact1 = await addLiquidity(routerContractInstance, token1, token2,  amount, amount, user)
  const tx1 = await artifact1.wait();
  console.log("Add liquidity tx:", tx1.transactionHash);

  const pair1 = await getPairAddress(factoryContractInstance, token1.address, token2.address)
  console.log('Pair1:', pair1)

  const artifact2 = await addLiquidityETH(routerContractInstance, token1,  amount, amount, user)
  const tx2 = await artifact2.wait();
  console.log("Add liquidity tx:", tx2.transactionHash);

  const pair2 = await getPairAddress(factoryContractInstance, token1.address, wethAddress)
  console.log('Pair2:', pair2)

  const artifact3 = await addLiquidityETH(routerContractInstance, token2,  amount, amount, user)
  const tx3 = await artifact3.wait();
  console.log("Add liquidity tx:", tx3.transactionHash);

  const pair3 = await getPairAddress(factoryContractInstance, token2.address, wethAddress)
  console.log('Pair3:', pair3)
})
