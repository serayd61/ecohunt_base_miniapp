const hre = require('hardhat');

async function main() {
  console.log('🌱 Starting EcoHunt GreenToken deployment to Base network...');

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Check balance (ethers v6 compatible)
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(balance), 'ETH');

  if (balance < hre.ethers.parseEther('0.0005')) {
    throw new Error('Insufficient ETH balance for deployment. Need at least 0.0005 ETH');
  }

  // Deploy GreenTokenV2
  console.log('\n📝 Deploying GreenTokenV2 contract...');
  const GreenToken = await hre.ethers.getContractFactory('GreenTokenV2');

  const greenToken = await GreenToken.deploy();
  await greenToken.waitForDeployment();

  const contractAddress = await greenToken.getAddress();
  console.log('✅ GreenTokenV2 deployed to:', contractAddress);

  // Get deployment transaction
  const deployTx = greenToken.deploymentTransaction();
  console.log('📄 Transaction hash:', deployTx.hash);

  // Wait for confirmations
  console.log('⏳ Waiting for block confirmations...');
  await deployTx.wait(5);

  // Verify contract
  console.log('\n🔍 Verifying contract on BaseScan...');
  try {
    await hre.run('verify:verify', {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log('✅ Contract verified on BaseScan');
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log('✅ Contract already verified');
    } else {
      console.log('⚠️ Contract verification failed:', error.message);
    }
  }

  console.log('\n🎉 Deployment completed successfully!');
  console.log(`📝 Contract Address: ${contractAddress}`);
  console.log(`🔗 BaseScan: https://basescan.org/address/${contractAddress}`);
  console.log('\nAdd this to your .env file:');
  console.log(`GREEN_TOKEN_CONTRACT_ADDRESS=${contractAddress}`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
