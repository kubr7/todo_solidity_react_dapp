// test/TaskContractTest.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaskContract", function () {
    let ContractFactory, contract, owner, addr1;
    let todayDate, tomorrowDate;

    beforeEach(async function () {
        ContractFactory = await ethers.getContractFactory("TaskContract");
        [owner, addr1] = await ethers.getSigners();
        contract = await ContractFactory.deploy();
        await contract.waitForDeployment();

        // Convert date to DDMMYYYY format
        const formatDate = (date) => {
            let d = date.getDate().toString().padStart(2, '0');
            let m = (date.getMonth() + 1).toString().padStart(2, '0');
            let y = date.getFullYear().toString();
            return `${d}${m}${y}`;
        };

        todayDate = formatDate(new Date());
        tomorrowDate = formatDate(new Date(Date.now() + 86400000));
    });


    it("Should create a task with a specific date", async function () {
        await contract.createTask(owner.address, "Test Task", todayDate);
        const tasks = await contract.getAllTasks(owner.address, todayDate); // ✅ Fetch for specific user
        expect(tasks.length).to.equal(1);
        expect(tasks[0].description).to.equal("Test Task");
    });

    it("Should retrieve all tasks for a date", async function () {
        await contract.createTask(owner.address, "Task 1", todayDate);
        await contract.createTask(owner.address, "Task 2", todayDate);

        const allTasks = await contract.getAllTasksForDate(todayDate);
        console.log("All tasks retrieved for date:", allTasks);  // ✅ Debugging log

        expect(allTasks.length).to.equal(2);  // Should be 2
    });


    it("Should allow assigning a task to another user", async function () {
        await expect(contract.createTaskForUser(addr1.address, "Assigned Task", todayDate))
            .to.emit(contract, "TaskCreated")
            .withArgs(addr1.address, "Assigned Task", owner.address, todayDate);

        const tasks = await contract.getAllTasks(addr1.address, todayDate);
        expect(tasks.length).to.equal(1);
        expect(tasks[0].description).to.equal("Assigned Task");
        expect(tasks[0].creator).to.equal(owner.address);
    });

    it("Should not allow creating a task for an invalid address", async function () {
        await expect(
            contract.createTaskForUser("0x0000000000000000000000000000000000000000", "Invalid Task", todayDate)
        ).to.be.revertedWith("Invalid user address");
    });

    it("Should update a task status by date", async function () {
        await contract.createTask(owner.address, "Test Task", todayDate);
        await contract.updateTask(0, 1, todayDate);

        const tasks = await contract.getAllTasks(owner.address, todayDate);
        console.log("Tasks before updating:", tasks);
        expect(tasks.length).to.be.greaterThan(0);
        expect(tasks[0].status).to.equal(1);
    });

    it("Should not allow non-assigned users to update task status", async function () {
        await contract.createTask(owner.address, "Test Task", todayDate);
        await contract.createTask(addr1.address, "Test Task 2", todayDate);
        await expect(
            contract.connect(addr1).updateTask(0, 1, todayDate)
        ).to.be.revertedWith("You can only update your own tasks");
    });

    it("Should retrieve only pending tasks for a user and date", async function () {
        await contract.createTask(owner.address, "Task 1", todayDate);
        await contract.createTask(owner.address, "Task 2", todayDate);
        await contract.updateTask(0, 1, todayDate);

        const pendingTasks = await contract.getPendingTasks(owner.address, todayDate); // ✅ Fix: Pass both user & date
        expect(pendingTasks.length).to.equal(1);
        expect(pendingTasks[0].description).to.equal("Task 2");
    });

    it("Should retrieve only completed tasks for a user and date", async function () {
        await contract.createTask(owner.address, "Task 1", todayDate);
        await contract.createTask(owner.address, "Task 2", todayDate);
        await contract.updateTask(0, 1, todayDate);

        const completedTasks = await contract.getCompletedTasks(owner.address, todayDate); // ✅ Fix: Pass both user & date
        expect(completedTasks.length).to.equal(1);
        expect(completedTasks[0].description).to.equal("Task 1");
    });

    it("Should create multiple tasks for different dates and retrieve correctly", async function () {
        await contract.createTask(owner.address, "Today's Task", todayDate);
        await contract.createTask(owner.address, "Tomorrow's Task", tomorrowDate);

        const todayTasks = await contract.getAllTasks(owner.address, todayDate);
        const tomorrowTasks = await contract.getAllTasks(owner.address, tomorrowDate);

        expect(todayTasks.length).to.equal(1);
        expect(todayTasks[0].description).to.equal("Today's Task");
        expect(tomorrowTasks.length).to.equal(1);
        expect(tomorrowTasks[0].description).to.equal("Tomorrow's Task");
    });
});
