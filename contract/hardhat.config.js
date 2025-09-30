require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-contract-sizer");

module.exports = {
  paths: {
    sources: "./contracts", 
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.24", 
        settings: {},
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 0
      }
    },
    zeroscan: {
      url: "https://rpc.zeroscan.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5080,
    }
  },
  etherscan: {
    apiKey: {
      zeroscan: "no-api-key-needed"
    },
    customChains: [
      {
        network: "zeroscan",
        chainId: 5080,
        urls: {
          apiURL: "https://zeroscan.org/api",
          browserURL: "https://zeroscan.org"
        }
      }
    ]
  },
  sourcify: {
    enabled: false 
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
    strict: true,
    only: [],
  },
};