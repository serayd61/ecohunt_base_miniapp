const hre = require('hardhat');

async function main() {
  console.log('🌱 Deploying EcoNFT contract to Base Mainnet...');

  const [deployer] = await hre.ethers.getSigners();
  console.log('Deployer:', deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Balance:', hre.ethers.formatEther(balance), 'ETH');

  // Deploy EcoNFT
  console.log('\n📝 Deploying EcoNFT...');
  const EcoNFT = await hre.ethers.getContractFactory('EcoNFT');
  const ecoNFT = await EcoNFT.deploy();
  await ecoNFT.waitForDeployment();

  const nftAddress = await ecoNFT.getAddress();
  console.log('✅ EcoNFT deployed to:', nftAddress);

  // Wait for confirmations
  const deployTx = ecoNFT.deploymentTransaction();
  console.log('Transaction hash:', deployTx.hash);
  console.log('Waiting for confirmations...');
  await deployTx.wait(5);

  // Verify on BaseScan
  console.log('\n🔍 Verifying on BaseScan...');
  try {
    await hre.run('verify:verify', {
      address: nftAddress,
      constructorArguments: [],
    });
    console.log('✅ Contract verified');
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log('✅ Already verified');
    } else {
      console.log('⚠️ Verification failed:', error.message);
    }
  }

  console.log('\n🎉 Deployment complete!');
  console.log(`ECO_NFT_ADDRESS=${nftAddress}`);
  console.log(`BaseScan: https://basescan.org/address/${nftAddress}`);

  return nftAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

