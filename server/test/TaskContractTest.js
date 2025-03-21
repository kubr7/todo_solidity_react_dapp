//test/TaskContractTest.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaskContract", function () {
    let ContractFactory, contract, owner, addr1;

    beforeEach(async function () {
        // Get the ContractFactory and Signers
        ContractFactory = await ethers.getContractFactory("TaskContract");
        [owner, addr1] = await ethers.getSigners();

        // Deploy the contract
        contract = await ContractFactory.deploy();
        await contract.waitForDeployment();
    });

    it("Should create a task", async function () {
        await contract.createTask(addr1.address, "Test Task");
        const tasks = await contract.getAllTasks(addr1.address);
        expect(tasks.length).to.equal(1);
        expect(tasks[0].description).to.equal("Test Task");
        expect(tasks[0].status).to.equal(0); // 0 = Pending
    });

    it("Should update a task status", async function () {
        await contract.createTask(owner.address, "Test Task");
        await contract.updateTask(0, 1); // 1 = Completed
        const tasks = await contract.getAllTasks(owner.address);
        expect(tasks[0].status).to.equal(1);
    });

    it("Should not allow non-assigned users to update task status", async function () {
        await contract.createTask(owner.address, "Test Task"); // Assign task to owner

        await expect(
            contract.connect(addr1).updateTask(0, 1) // addr1 tries to update owner's task
        ).to.be.revertedWith("Invalid task index"); // addr1 has no tasks, so index is invalid
    });




    it("Should retrieve only pending tasks", async function () {
        await contract.createTask(owner.address, "Task 1");
        await contract.createTask(owner.address, "Task 2");
        await contract.updateTask(0, 1); // Mark Task 1 as Completed

        const pendingTasks = await contract.getPendingTasks(owner.address);
        expect(pendingTasks.length).to.equal(1);
        expect(pendingTasks[0].description).to.equal("Task 2");
    });

    it("Should retrieve only completed tasks", async function () {
        await contract.createTask(owner.address, "Task 1");
        await contract.createTask(owner.address, "Task 2");
        await contract.updateTask(0, 1); // Mark Task 1 as Completed

        const completedTasks = await contract.getCompletedTasks(owner.address);
        expect(completedTasks.length).to.equal(1);
        expect(completedTasks[0].description).to.equal("Task 1");
    });
});
