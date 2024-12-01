const hre = require("hardhat");

async function main() {
  // Deploy Project Management Contract
  const ProjectManagement = await hre.ethers.getContractFactory("ProjectManagement");
  const projectManagement = await ProjectManagement.deploy();
  await projectManagement.deployed();
  console.log("ProjectManagement deployed to:", projectManagement.address);

  // Deploy Governance Contract
  const SMEGovernance = await hre.ethers.getContractFactory("SMEGovernance");
  const governance = await SMEGovernance.deploy();
  await governance.deployed();
  console.log("SMEGovernance deployed to:", governance.address);

  // Deploy Reputation System
  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputation = await ReputationSystem.deploy();
  await reputation.deployed();
  console.log("ReputationSystem deployed to:", reputation.address);

  // Save contract addresses to .env file
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf-8');
  const updatedEnv = envContent
    .replace(/PROJECT_CONTRACT_ADDRESS=.*/, `PROJECT_CONTRACT_ADDRESS=${projectManagement.address}`)
    .replace(/GOVERNANCE_CONTRACT_ADDRESS=.*/, `GOVERNANCE_CONTRACT_ADDRESS=${governance.address}`)
    .replace(/REPUTATION_CONTRACT_ADDRESS=.*/, `REPUTATION_CONTRACT_ADDRESS=${reputation.address}`);
  
  fs.writeFileSync('.env', updatedEnv);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });