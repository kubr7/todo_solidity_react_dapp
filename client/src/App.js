//src/app.js
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
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import DensitySmallIcon from '@mui/icons-material/DensitySmall';
import {
  connectWallet,
  createTask,
  updateTask,
  filteredTasks
} from "./utils/interact";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [taskFilter, setTaskFilter] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      const account = await connectWallet();
      if (account) {
        setCurrentAccount(account);
        setCorrectNetwork(true);
        loadTasks(account, taskFilter);
      }
    };
    initialize();
  }, [taskFilter]);

  const loadTasks = async (account, filter) => {
    const tasksList = await filteredTasks(account, filter);
    setTasks(tasksList);
  };

  const handleCreateTask = async () => {
    if (input.trim() && currentAccount) {
      const success = await createTask(currentAccount, input);
      if (success) {
        setInput("");
        loadTasks(currentAccount);
      }
    }
  };

  const handleUpdateTask = async (index) => {
    const success = await updateTask(index, 1);
    if (success) loadTasks(currentAccount);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <img src="/logo.png" alt="Logo" width={40} height={40} />
        <Typography variant="h5" component="h1">
          Task Management DApp
        </Typography>
      </Box>
      {currentAccount ? (
        correctNetwork ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <TextField
                label="New Task"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                sx={{
                  width: "300px",
                  "& .MuiInputBase-input": { color: "#1976d2" },
                  "& .MuiInputLabel-root": { color: "#1976d2" },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateTask}
                endIcon={<AddBoxIcon />}
              >
                Create Task
              </Button>
            </div>
            <Box sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}>
              <Button variant="text" endIcon={<DensitySmallIcon sx={{ color: "#000000" }} />} onClick={() => setTaskFilter(null)} sx={{ margin: "5px" }}>
                All Tasks
              </Button>
              <Button variant="text" endIcon={<CheckCircleIcon sx={{ color: "#388e3c" }} />} onClick={() => setTaskFilter(1)} sx={{ margin: "5px" }}>
                Completed Tasks
              </Button>
              <Button variant="text" endIcon={<AccessAlarmIcon sx={{ color: "#7D0A0A" }} />} onClick={() => setTaskFilter(0)} sx={{ margin: "5px" }}>
                Pending Tasks
              </Button>
            </Box>
            <List>
              {tasks.map((task, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    marginBottom: "5px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <ListItemText
                    primary={`${index + 1}. ${task.description}`}
                    sx={{
                      "& .MuiTypography-root": { color: "#333" },
                    }}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {task.status === 0 ? (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleUpdateTask(index)}
                        >
                          Mark as Completed
                        </Button>
                        <AccessAlarmIcon sx={{ color: "#7D0A0A" }} />
                        <Typography color="error">Pending</Typography>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon sx={{ color: "#388e3c" }} />
                        <Typography color="success">Completed</Typography>
                      </>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <p>Please connect to the Sepolia Testnet.</p>
        )
      ) : (
        <Button variant="contained" color="primary" onClick={connectWallet}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

export default App;
