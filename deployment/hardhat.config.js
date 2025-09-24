require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: BASE_RPC_URL,
      },
    },
    base: {
      url: BASE_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 8453,
      gasPrice: 'auto',
      gas: 'auto',
    },
    baseTestnet: {
      url: 'https://goerli.base.org',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84531,
      gasPrice: 'auto',
      gas: 'auto',
    },
  },
  etherscan: {
    apiKey: {
      base: BASESCAN_API_KEY,
      baseTestnet: BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org/',
        },
      },
    ],
  },
};