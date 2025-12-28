const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Address:', deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Balance:', hre.ethers.formatEther(balance), 'ETH');
  
  if (balance < hre.ethers.parseEther('0.001')) {
    console.log('\n⚠️ WARNING: Low balance! Need at least 0.001 ETH for deployment.');
  } else {
    console.log('\n✅ Balance sufficient for deployment!');
  }
}

main().catch(console.error);

