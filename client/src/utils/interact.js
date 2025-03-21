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
        console.log('Found account:', accounts[0]);
        return accounts[0];
    } catch (error) {
        console.log('Error connecting to metamask:', error);
        return null;
    }
};

// Fetch all tasks for a given user.
export const fetchTasks = async (userAddress) => {
    if (!contract) await initContract();

    try {
        const tasksList = await contract.getAllTasks(userAddress);
        console.log("Fetched tasks:", tasksList);

        return tasksList.map(task => ({
            description: task.description,
            status: Number(task.status),
            creator: task.creator
        }));
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};

// Create a new task for the user.
export const createTask = async (userAddress, description) => {
    if (!contract) await initContract();

    try {
        const txn = await contract.createTask(userAddress, description);
        await txn.wait();
        console.log("Task created successfully.");
        return true;
    } catch (error) {
        console.error("Error creating task:", error);
        return false;
    }
};

// Update task status.
export const updateTask = async (index, status) => {
    if (!contract) await initContract();

    try {
        const txn = await contract.updateTask(index, status);
        await txn.wait();
        console.log("Task updated successfully.");
        return true;
    } catch (error) {
        console.error("Error updating task:", error);
        return false;
    }
};


// Fetch filtered tasks by status (0 = Pending, 1 = Completed)
export const filteredTasks = async (userAddress, status) => {
    if (!contract) await initContract();

    try {
        let tasksList;
        if (status === 0) {
            tasksList = await contract.getPendingTasks(userAddress);
        } else if (status === 1) {
            tasksList = await contract.getCompletedTasks(userAddress);
        } else {
            tasksList = await contract.getAllTasks(userAddress);
        }

        console.log("Filtered tasks:", tasksList);

        const formattedTasks = tasksList.map(task => ({
            description: task.description,
            status: Number(task.status),  // Convert from BigNumber if necessary
            creator: task.creator
        }));

        console.log("Formatted Filtered Tasks:", formattedTasks);
        return formattedTasks;
    } catch (error) {
        console.log("Error fetching filtered tasks:", error);
        return [];
    }
};