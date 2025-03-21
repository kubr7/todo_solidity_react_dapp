// contracts/TaskContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TaskContract {
    enum TaskStatus {
        Pending,
        Completed
    } // Enum for task status

    struct Task {
        string description;
        TaskStatus status;
        address creator;
    }

    mapping(address => Task[]) private userTasks;

    event TaskCreated(
        address indexed assignedTo,
        string description,
        address creator
    );
    event TaskUpdated(
        address indexed assignedTo,
        uint taskIndex,
        TaskStatus status
    );

    // Modifier to ensure only assigned user can update task
    modifier onlyAssignedUser(address _user, uint _taskIndex) {
        require(msg.sender == _user, "You can only update your own tasks"); // Check ownership first
        require(_taskIndex < userTasks[_user].length, "Invalid task index"); // Then check index
        _;
    }

    // Function to create a task for any user
    function createTask(address _user, string memory _description) public {
        userTasks[_user].push(
            Task(_description, TaskStatus.Pending, msg.sender)
        );
        emit TaskCreated(_user, _description, msg.sender);
    }

    // Function to update task status (Only assigned user can update)
    function updateTask(
        uint _taskIndex,
        TaskStatus _status
    ) public onlyAssignedUser(msg.sender, _taskIndex) {
        userTasks[msg.sender][_taskIndex].status = _status;
        emit TaskUpdated(msg.sender, _taskIndex, _status);
    }

    // Get all tasks assigned to a user
    function getAllTasks(address _user) public view returns (Task[] memory) {
        return userTasks[_user];
    }

    // Get pending tasks of a user
    function getPendingTasks(address _user) public view returns (Task[] memory) {
        return filterTasks(_user, TaskStatus.Pending);
    }

    // Get completed tasks of a user
    function getCompletedTasks(address _user) public view returns (Task[] memory) {
        return filterTasks(_user, TaskStatus.Completed);
    }

    // Internal function to filter tasks by status
    function filterTasks(address _user, TaskStatus _status) internal view returns (Task[] memory) {
        uint count = 0;
        for (uint i = 0; i < userTasks[_user].length; i++) {
            if (userTasks[_user][i].status == _status) {
                count++;
            }
        }

        Task[] memory filteredTasks = new Task[](count);
        uint index = 0;
        for (uint i = 0; i < userTasks[_user].length; i++) {
            if (userTasks[_user][i].status == _status) {
                filteredTasks[index] = userTasks[_user][i];
                index++;
            }
        }
        return filteredTasks;
    }
}
