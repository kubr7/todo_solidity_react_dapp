// src/app.js

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {
  connectWallet,
  createTask,
  updateTask,
  createTaskForUser,
  getTasksByStatus,
  getAllTasksForDate,
} from "./utils/interact";
import "./App.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskType, setTaskType] = useState("self");
  const [input, setInput] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [taskFilter, setTaskFilter] = useState(null);
  const [targetUser, setTargetUser] = useState("");
  const [targetTaskDescription, setTargetTaskDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  useEffect(() => {
    const initialize = async () => {
      const account = await connectWallet();
      if (account) {
        setCurrentAccount(account);
        setCorrectNetwork(true);
        loadTasks(account, taskFilter, selectedDate);
      }
    };
    initialize();
  }, [selectedDate, taskFilter]);

  const loadTasks = async (userAddress, filter, date) => {
    if (!userAddress) {
      console.error("No user address found!");
      return;
    }

    try {
      let tasksList;
      if (filter === "allUsers") {
        tasksList = await getAllTasksForDate(date);
      } else {
        tasksList = await getTasksByStatus(userAddress, date, filter);
      }
      setTasks(tasksList);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleCreateTask = async () => {
    if (input.trim() && currentAccount) {
      const success = await createTask(currentAccount, input, selectedDate);
      if (success) {
        setInput("");
        loadTasks(currentAccount, taskFilter, selectedDate);
        toast.success("Task has created!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } else {
        toast.error("Task creation failed.", {
          position: "top-center",
          autoClose: 3000,
          theme: "light",
        });
      }
    }
  };

  const handleCreateTaskForUser = async () => {
    if (!targetUser.trim() || !targetTaskDescription.trim()) {
      console.error("Error: User address and task description are required.");
      return;
    }

    const success = await createTaskForUser(
      targetUser,
      targetTaskDescription,
      selectedDate
    );
    if (success) {
      setTargetTaskDescription("");
      setTargetUser("");
      loadTasks(currentAccount, taskFilter, selectedDate);
      toast.success(`Task has created for ${targetUser}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } else {
      toast.error("Task creation failed.", {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
      console.error("Task assignment failed.");
    }
  };

  const handleUpdateTask = async (index) => {
    const success = await updateTask(index, 1, selectedDate);
    if (success) {
      loadTasks(currentAccount, taskFilter, selectedDate);
      toast.success("Task marked as completed!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } else {
      toast.error("Task update failed.", {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
      console.error("Task update failed.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      {currentAccount ? (
        correctNetwork ? (
          <>
            <ToastContainer />
            <Box
              sx={{ display: "flex", alignItems: "center", justifyContent: "start" }}
            >
              <img src="/logo.png" alt="Logo" width={80} height={80} />
              <Typography
                variant="h5"
                component="h1"
                color="#06d7d8"
                fontFamily="cursive"
              >
                Task Management DApp
              </Typography>
            </Box>
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <Box>
                <TextField
                  label="Select Date"
                  type="date"
                  value={convertToInputFormat(selectedDate)}
                  onChange={(e) =>
                    setSelectedDate(convertToDDMMYYYY(e.target.value))
                  }
                  variant="outlined"
                  sx={{
                    "& .MuiInputBase-input": { color: "#B4EBE6", padding: "8px 8px" },
                    "& .MuiInputLabel-root": {
                      color: "#099494",
                      fontWeight: "bold",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#099494" },
                      "&:hover fieldset": { borderColor: "#066666" },
                      "&.Mui-focused fieldset": { borderColor: "#0f444d" },
                    },
                  }}
                />
              </Box>
            </div>
            <div>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px",
                  backgroundColor: "#F0F3FF",
                  borderRadius: "5px",
                  gap: "20px",
                }}
              >
                {/* Buttons to Select Task Type */}
                <Box sx={{ display: "flex", gap: "20px" }}>
                  <Button
                    variant={taskType === "self" ? "contained" : "standard"}
                    onClick={() => setTaskType("self")}
                    color="#FFB22C"
                    sx={{ color: taskType === "self" ? "#4DA1A9" : "#7D0A0A", fontWeight: "bold" }}
                  >
                    Task for Self
                  </Button>
                  <Button
                    variant={taskType === "other" ? "contained" : "standard"}
                    onClick={() => setTaskType("other")}
                    color="#261FB3"
                    sx={{ color: taskType === "other" ? "#4DA1A9" : "#7D0A0A", fontWeight: "bold" }}
                  >
                    Task for Other
                  </Button>
                </Box>

                {/* Task for Self */}
                {taskType === "self" && (
                  <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                    <TextField
                      label="Task for Self"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      sx={{
                        width: "300px",
                        "& .MuiInputBase-input": { color: "#C93D1B", fontWeight: "bold" },
                        "& .MuiInputLabel-root": { color: "#099494", fontSize: "14px", textTransform: "capitalize" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#C93D1B", fontSize: "16px" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#099494" },
                          "&:hover fieldset": { borderColor: "#099494" },
                          "&.Mui-focused fieldset": { borderColor: "#06d7d8" },
                        },
                      }}
                    />
                    <Button variant="contained" onClick={handleCreateTask} endIcon={<AddBoxIcon />} color="#193344"
                      sx={{ color: "#0f444d", fontWeight: "bold" }}>
                      Create Task
                    </Button>
                  </Box>
                )}

                {/* Task for Other */}
                {taskType === "other" && (
                  <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                    <TextField
                      label="Assign to (User Address)"
                      value={targetUser}
                      onChange={(e) => setTargetUser(e.target.value)}
                      sx={{
                        width: "300px",
                        "& .MuiInputBase-input": { color: "#C93D1B", fontWeight: "bold" },
                        "& .MuiInputLabel-root": { color: "#099494", fontSize: "14px", textTransform: "capitalize" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#C93D1B", fontSize: "16px" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#099494" },
                          "&:hover fieldset": { borderColor: "#099494" },
                          "&.Mui-focused fieldset": { borderColor: "#06d7d8" },
                        },
                      }}
                    />
                    <TextField
                      label="Task"
                      value={targetTaskDescription}
                      onChange={(e) => setTargetTaskDescription(e.target.value)}
                      sx={{
                        width: "300px",
                        "& .MuiInputBase-input": { color: "#C93D1B", fontWeight: "bold" },
                        "& .MuiInputLabel-root": { color: "#099494", fontSize: "14px", textTransform: "capitalize" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#C93D1B", fontSize: "16px" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#099494" },
                          "&:hover fieldset": { borderColor: "#099494" },
                          "&.Mui-focused fieldset": { borderColor: "#06d7d8" },
                        },
                      }}
                    />
                    <Button variant="contained" onClick={handleCreateTaskForUser} endIcon={<AssignmentIcon />} color="#193344"
                      sx={{ color: "#0f444d", fontWeight: "bold" }}>
                      Assign Task
                    </Button>
                  </Box>
                )}
              </Box>
            </div>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: "center",
                    color: "#BBE1FA",
                    fontFamily: "monospace",
                    fontSize: "26px",
                  }}
                >
                  Tasks for: {formatDisplayDate(selectedDate)}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="text"
                  endIcon={<AssignmentIcon sx={{ color: "#BBE1FA" }} />}
                  onClick={() => setTaskFilter(null)}
                  sx={{ margin: "5px", color: "#F98404" }}
                >
                  My Tasks
                </Button>
                <Button
                  variant="text"
                  endIcon={<CheckCircleIcon sx={{ color: "#388e3c" }} />}
                  onClick={() => setTaskFilter(1)}
                  sx={{ margin: "5px", color: "#F98404" }}
                >
                  Completed Tasks
                </Button>
                <Button
                  variant="text"
                  endIcon={<PendingIcon sx={{ color: "#7D0A0A" }} />}
                  onClick={() => setTaskFilter(0)}
                  sx={{ margin: "5px", color: "#F98404" }}
                >
                  Pending Tasks
                </Button>
                <Button
                  variant="text"
                  endIcon={<AssignmentIcon />}
                  onClick={() => setTaskFilter("allUsers")}
                >
                  All Users' Tasks
                </Button>
              </Box>
            </Box>

            <div
              style={{
                padding: "0 40px",
              }}
            >
              <List>
                {tasks.map((task, index) => (
                  <ListItem
                    key={index}
                    variant="contained"
                    sx={{
                      borderBottom: "1px solid #00AF91",
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: "14px", color: "#A6F6F1" }}>
                          {index + 1}. {task.description}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography component="span" sx={{ fontSize: "10px", color: "#CEE397" }}>
                            (By: {task.creator})
                          </Typography>{" "}
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "12px",
                              color: task.userAddress === task.creator ? "#7579E7" : "#32E0C4",
                            }}
                          >
                            (For: {task.userAddress})
                          </Typography>
                        </Box>
                      }
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {task.status === 0 ? (
                        <>
                          <Typography color="error" fontSize="12px">
                            Pending
                          </Typography>
                          <PendingIcon
                            sx={{ color: "#7D0A0A", fontSize: "18px" }}
                          />
                          {task.creator === task.userAddress && (
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleUpdateTask(index)}
                              endIcon={<AssignmentTurnedInIcon sx={{ fontSize: "18px" }} />}
                              sx={{ fontSize: "12px" }}
                            >
                              Mark as Completed
                            </Button>
                          )}

                        </>
                      ) : (
                        <>
                          <Typography color="success" fontSize="12px">
                            Completed
                          </Typography>
                          <CheckCircleIcon
                            sx={{ color: "#388e3c", fontSize: "18px" }}
                          />
                        </>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </div>
          </>
        ) : (
          <p>Please connect to the Sepolia Testnet.</p>
        )
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "start" }}
          >
            <img src="/logo.png" alt="Logo" width={80} height={80} />
            <Typography
              variant="h5"
              component="h1"
              color="#06d7d8"
              fontFamily="cursive"
            >
              Task Management DApp
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button variant="contained" color="primary" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </Box>
        </div>
      )}
    </div>
  );
}

// Get today's date in DDMMYYYY format
function getTodayDate() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString();
  return `${day}${month}${year}`;
}

// Convert YYYY-MM-DD (from input field) to DDMMYYYY format
function convertToDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return `${parts[2]}${parts[1]}${parts[0]}`; // DDMMYYYY
}

// Convert DDMMYYYY to YYYY-MM-DD for input field
function convertToInputFormat(dateStr) {
  if (!dateStr || dateStr.length !== 8) return "";
  const day = dateStr.substring(0, 2);
  const month = dateStr.substring(2, 4);
  const year = dateStr.substring(4, 8);
  return `${year}-${month}-${day}`; // YYYY-MM-DD
}

// Convert DDMMYYYY to "DD-MM-YYYY" for display
function formatDisplayDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return "";

  const day = dateStr.substring(0, 2);
  const month = dateStr.substring(2, 4);
  const year = dateStr.substring(4, 8);

  // Convert to a valid date format
  const date = new Date(`${year}-${month}-${day}`); // YYYY-MM-DD

  // Get the full weekday name
  const options = { weekday: "long" };
  const dayName = new Intl.DateTimeFormat("en-US", options).format(date);

  return `${dayName}, ${day}-${month}-${year}`; // Example: "Monday, 26-08-2024"
}

export default App;
