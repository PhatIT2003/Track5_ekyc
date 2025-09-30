const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
  const BusinessKYC = m.contract("BusinessKYC");

  return { BusinessKYC };
});

module.exports = TokenModule;