const hre = require('hardhat');

async function main() {
  const ECO_NFT_ADDRESS = '0xf477A5BD99AFfaC62c130Ae09C4352CFd792a803';
  const GREEN_TOKEN_ADDRESS = '0x769Faa55AAfab4FBef229B398F2B09aa38F5730c';
  
  const [deployer] = await hre.ethers.getSigners();
  console.log('Setting up with account:', deployer.address);

  // Add deployer as minter for EcoNFT
  console.log('\n📝 Adding minter to EcoNFT...');
  const EcoNFT = await hre.ethers.getContractAt('EcoNFT', ECO_NFT_ADDRESS);
  
  const isMinter = await EcoNFT.minters(deployer.address);
  if (!isMinter) {
    const tx1 = await EcoNFT.addMinter(deployer.address);
    await tx1.wait();
    console.log('✅ Added deployer as minter');
  } else {
    console.log('✅ Deployer is already a minter');
  }

  // Add deployer as verifier for GreenToken
  console.log('\n📝 Adding verifier to GreenToken...');
  const GreenToken = await hre.ethers.getContractAt('GreenTokenV2', GREEN_TOKEN_ADDRESS);
  
  const isVerifier = await GreenToken.verifiers(deployer.address);
  if (!isVerifier) {
    const tx2 = await GreenToken.addVerifier(deployer.address);
    await tx2.wait();
    console.log('✅ Added deployer as verifier');
  } else {
    console.log('✅ Deployer is already a verifier');
  }

  console.log('\n🎉 Setup complete!');
  console.log('Minter/Verifier address:', deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

