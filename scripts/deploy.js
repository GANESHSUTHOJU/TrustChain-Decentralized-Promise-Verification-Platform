const hre = require("hardhat");

async function main() {
  const TrustChain = await hre.ethers.getContractFactory("TrustChain");
  const trustChain = await TrustChain.deploy();
  if (typeof trustChain.waitForDeployment === 'function') {
    await trustChain.waitForDeployment();
  } else if (typeof trustChain.deployed === 'function') {
    await trustChain.deployed();
  }
  console.log("TrustChain deployed to:", trustChain.address || trustChain.target);

  // Create 2 test promises for verification
  console.log("\n📝 Creating test promises...");
  
  const tx1 = await trustChain.createPromise(
    "Complete Project Submission",
    "Submit the blockchain project before the deadline for peer review and evaluation",
    "Work"
  );
  await tx1.wait();
  console.log("✅ Promise 1 created: 'Complete Project Submission'");

  const tx2 = await trustChain.createPromise(
    "Learn Solidity",
    "Master Solidity programming and understand smart contract security best practices",
    "Learning"
  );
  await tx2.wait();
  console.log("✅ Promise 2 created: 'Learn Solidity'");

  console.log("\n🎉 Test promises ready for verification!");
  console.log("Use Promise IDs 0 and 1 to verify in the frontend");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
