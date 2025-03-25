//src/utils/interact.js
import { BrowserProvider, Contract } from 'ethers';
import TaskAbi from './TaskContract.json';
import { TaskContractAddress } from '../config';

let contract = null;

// Initialize Ethereum contract instance.
export const initContract = async () => {
    if (window.ethereum) {
        const ethProvider = new BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        contract = new Contract(TaskContractAddress, TaskAbi.abi, signer);
        console.log("Available contract functions:", Object.keys(contract));
        return contract;
    } else {
        console.log("Ethereum object not found. Install Metamask.");
        return null;
    }
};

// Connect to MetaMask and return account.
export const connectWallet = async () => {
    try {
        const { ethereum } = window;
        if (!ethereum) {
            console.log('Metamask not detected');
            return null;
        }

        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log('Connected to chain:', chainId);

        const sepoliaChainId = '0xaa36a7';
        if (chainId !== sepoliaChainId) {
            alert('You are not connected to the Sepolia Testnet!');
            return null;
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected account:', accounts[0]);
        return accounts[0];
    } catch (error) {
        console.log('Error connecting to metamask:', error);
        return null;
    }
};

// Create a new task for the user.
export const createTask = async (userAddress, description, selectedDate) => {
    if (!contract) await initContract();

    try {
        const txn = await contract.createTask(userAddress, description, selectedDate);
        await txn.wait();
        console.log(userAddress);
        return true;
    } catch (error) {
        console.error("Error creating task:", error);
        return false;
    }
};


export const createTaskForUser = async (targetUserAddress, description, selectedDate) => {
    if (!contract) await initContract();

    if (!targetUserAddress || targetUserAddress.length !== 42) {
        console.error("Invalid user address");
        return false;
    }

    try {
        console.log(`Assigning task to ${targetUserAddress} on ${selectedDate}`);
        const txn = await contract.createTaskForUser(targetUserAddress, description, selectedDate);
        const receipt = await txn.wait();

        if (receipt.status === 1) {
            console.log(`Task successfully assigned to ${targetUserAddress}`);
            console.log(`Task Description: ${description}`);
            console.log(targetUserAddress);
            return true;
        } else {
            console.error("Transaction failed.");
            return false;
        }
    } catch (error) {
        console.error("Error assigning task:", error);
        return false;
    }
};


// Update task status.
export const updateTask = async (index, status, selectedDate) => {
    if (!contract) await initContract();

    try {
        const txn = await contract.updateTask(index, status, selectedDate);
        await txn.wait();
        console.log("Task updated successfully.");
        return true;
    } catch (error) {
        console.error("Error updating task:", error);
        return false;
    }
};

// Fetch tasks based on status (Pending, Completed, All)
export const getTasksByStatus = async (userAddress, selectedDate, status) => {
    if (!contract) await initContract();

    try {
        let tasksList;

        if (status === 0) {
            tasksList = await contract.getPendingTasks(userAddress, selectedDate);
        } else if (status === 1) {
            tasksList = await contract.getCompletedTasks(userAddress, selectedDate);
        } else {
            tasksList = await contract.getAllTasks(userAddress, selectedDate);
        }

        const formattedTasks = tasksList.map(task => ({
            description: task.description,
            status: Number(task.status),
            creator: task.creator,
            userAddress: task.assignedTo || task.creator
        }));

        console.log(`Tasks for ${userAddress} on ${selectedDate}:`, formattedTasks);
        return formattedTasks;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};


// Fetch tasks by Date
export const getAllTasksForDate = async (selectedDate) => {
    if (!contract) await initContract();

    try {
        const allTasks = await contract.getAllTasksForDate(selectedDate);

        return allTasks.map(task => ({
            description: task.description,
            status: Number(task.status),
            creator: task.creator,
            userAddress: task.assignedTo || task.creator
        }));
    } catch (error) {
        console.error("Error fetching all tasks for date:", error);
        return [];
    }
};

// Fetch all Users 
export const fetchUsersFromContract = async () => {
    if (!contract) await initContract();

    try {
        const allUsers = await contract.getUserList()
        return allUsers;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

// Fetch Tasks by User Address
export const fetchTasksByAddress = async (userAddress) => {
    if (!contract) await initContract();

    try {
        if (!userAddress) {
            throw new Error("User address is required");
        }

        const usersTasks = await contract.getTasksByAddress(userAddress);
        return usersTasks;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};
