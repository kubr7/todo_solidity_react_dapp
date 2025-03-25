// contracts/TaskContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TaskContract {
    enum TaskStatus {
        Pending,
        Completed
    }

    struct Task {
        string description;
        TaskStatus status;
        address creator;
        address assignedTo;
    }

    // Mapping: User -> List of tasks (ignoring dates)
    mapping(address => Task[]) private userTasks;

    // Mapping of users to their tasks by date
    // Mapping: User -> Date -> List of tasks
    mapping(address => mapping(uint => Task[])) private userTasksByDate;

    // List of users who have tasks
    address[] public userList;
    mapping(address => bool) public isUserTracked;

    event TaskCreated(
        address indexed assignedTo,
        string description,
        address creator,
        uint date
    );
    event TaskUpdated(
        address indexed assignedTo,
        uint taskIndex,
        TaskStatus status,
        uint date
    );

    // Function to add a new user to userList
    function addUser(address _user) internal {
        if (!isUserTracked[_user]) {
            userList.push(_user);
            isUserTracked[_user] = true;
        }
    }

    // Modifier to ensure only assigned user can update task
    modifier onlyAssignedUser(
        address _user,
        uint _taskIndex,
        uint _date
    ) {
        require(
            userTasksByDate[_user][_date].length > 0,
            "No tasks found for user"
        );
        require(
            _taskIndex < userTasksByDate[_user][_date].length,
            "Invalid task index"
        );
        require(
            userTasksByDate[_user][_date][_taskIndex].creator == msg.sender,
            "You can only update your own tasks"
        );
        _;
    }

    function createTask(
        address _user,
        string memory _description,
        uint _date
    ) public {
        addUser(_user);

        Task memory newTask = Task({
            description: _description,
            status: TaskStatus.Pending,
            creator: msg.sender,
            assignedTo: _user // ✅ Store assigned user's address
        });

        userTasksByDate[_user][_date].push(newTask);
        // ✅ Store task directly under the user
        userTasks[_user].push(newTask);

        emit TaskCreated(_user, _description, msg.sender, _date);
    }

    function createTaskForUser(
        address _user,
        string memory _description,
        uint _date
    ) public {
        require(_user != address(0), "Invalid user address");

        Task memory newTask = Task({
            description: _description,
            status: TaskStatus.Pending,
            creator: msg.sender,
            assignedTo: _user // ✅ Store assigned user's address
        });

        userTasksByDate[_user][_date].push(newTask);
        // ✅ Store task directly under the user
        userTasks[_user].push(newTask);
        addUser(_user);

        emit TaskCreated(_user, _description, msg.sender, _date);
    }

    // Function to update task status (Only assigned user can update)
    // Function to update a task status
    function updateTask(
        uint _taskIndex,
        TaskStatus _status,
        uint _date
    ) public onlyAssignedUser(msg.sender, _taskIndex, _date) {
        userTasksByDate[msg.sender][_date][_taskIndex].status = _status;
        emit TaskUpdated(msg.sender, _taskIndex, _status, _date);
    }

    function getAllTasks(
        address _user,
        uint _date
    ) public view returns (Task[] memory) {
        Task[] memory tasks = userTasksByDate[_user][_date];

        for (uint i = 0; i < tasks.length; i++) {
            tasks[i].assignedTo = _user;
        }

        return tasks;
    }

    // Get all tasks for a user on a specific date
    // Function to get all tasks for all users on a specific date
    function getAllTasksForDate(
        uint _date
    ) public view returns (Task[] memory) {
        uint totalTasks = 0;

        // Count total tasks
        for (uint i = 0; i < userList.length; i++) {
            // totalTasks += userTasksByDate[userList[i]][_date].length;
            address user = userList[i];
            totalTasks += userTasksByDate[user][_date].length;
        }
        // console.log("Total tasks found:", totalTasks);

        Task[] memory allTasks = new Task[](totalTasks);
        uint index = 0;

        // Collect tasks
        for (uint i = 0; i < userList.length; i++) {
            address user = userList[i];
            for (uint j = 0; j < userTasksByDate[user][_date].length; j++) {
                Task storage task = userTasksByDate[user][_date][j];
                allTasks[index] = Task({
                    description: task.description,
                    status: task.status,
                    creator: task.creator,
                    assignedTo: user // ✅ Set assignedTo field
                });
                index++;
            }
        }

        return allTasks;
    }

    // Get pending tasks for a specific user on a specific date
    function getPendingTasks(
        address _user,
        uint _date
    ) public view returns (Task[] memory) {
        return filterTasks(_user, _date, TaskStatus.Pending);
    }

    // Get completed tasks for a specific user on a specific date
    function getCompletedTasks(
        address _user,
        uint _date
    ) public view returns (Task[] memory) {
        return filterTasks(_user, _date, TaskStatus.Completed);
    }

    // Internal function to filter tasks by user, date, and status
    function filterTasks(
        address _user,
        uint _date,
        TaskStatus _status
    ) internal view returns (Task[] memory) {
        uint count = 0;

        // Count tasks matching status
        for (uint i = 0; i < userTasksByDate[_user][_date].length; i++) {
            if (userTasksByDate[_user][_date][i].status == _status) {
                count++;
            }
        }

        // Create filtered array
        Task[] memory filteredTasks = new Task[](count);
        uint index = 0;

        for (uint i = 0; i < userTasksByDate[_user][_date].length; i++) {
            if (userTasksByDate[_user][_date][i].status == _status) {
                filteredTasks[index] = userTasksByDate[_user][_date][i];
                index++;
            }
        }

        return filteredTasks;
    }

    function getUserList() public view returns (address[] memory) {
        return userList;
    }

    function getTasksByAddress(
        address _user
    ) public view returns (Task[] memory) {
        return userTasks[_user];
    }
}
