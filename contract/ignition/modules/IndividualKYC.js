const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
  const IndividualKYC = m.contract("IndividualKYC");

  return { IndividualKYC };
});

module.exports = TokenModule;