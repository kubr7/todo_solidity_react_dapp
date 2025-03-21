//scripts/deploy.js
const hre = require("hardhat");

const main = async () => {
    await hre.run("compile"); // Compile the contract (if not already compiled)
    console.log("Deploying contract...");
    const ContractFactory = await hre.ethers.getContractFactory("TaskContract");  // Get the contract factory
    const contract = await ContractFactory.deploy(); // Deploy the contract
    await contract.waitForDeployment();

    console.log("Contract deployed to:", await contract.getAddress());
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

runMain();