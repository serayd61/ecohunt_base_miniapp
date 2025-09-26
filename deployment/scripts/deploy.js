const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🌱 Starting EcoHunt GreenToken deployment to Base network...');

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Check balance
  const balance = await deployer.getBalance();
  console.log('Account balance:', hre.ethers.utils.formatEther(balance), 'ETH');

  if (balance.lt(hre.ethers.utils.parseEther('0.01'))) {
    throw new Error('Insufficient ETH balance for deployment. Need at least 0.01 ETH');
  }

  // Deploy GreenTokenV2
  console.log('\n📝 Deploying GreenTokenV2 contract...');
  const GreenToken = await hre.ethers.getContractFactory('GreenTokenV2');

  const greenToken = await GreenToken.deploy();
  await greenToken.deployed();

  console.log('✅ GreenTokenV2 deployed to:', greenToken.address);
  console.log('📄 Transaction hash:', greenToken.deployTransaction.hash);

  // Wait for confirmations
  console.log('⏳ Waiting for block confirmations...');
  await greenToken.deployTransaction.wait(5);

  // Verify contract
  console.log('\n🔍 Verifying contract on BaseScan...');
  try {
    await hre.run('verify:verify', {
      address: greenToken.address,
      constructorArguments: [],
    });
    console.log('✅ Contract verified on BaseScan');
  } catch (error) {
    console.log('⚠️ Contract verification failed:', error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: greenToken.address,
    deployer: deployer.address,
    transactionHash: greenToken.deployTransaction.hash,
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, '..', 'deployments.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log('\n🎉 Deployment completed successfully!');
  console.log(`📝 Contract Address: ${greenToken.address}`);
  console.log('\nAdd this to your .env file:');
  console.log(`GREEN_TOKEN_CONTRACT_ADDRESS=${greenToken.address}`);

  return greenToken.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });