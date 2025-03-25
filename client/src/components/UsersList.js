// src/components/UsersList.js
import { useState, useEffect } from 'react';
import { fetchUsersFromContract } from '../utils/interact';
import { Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const userList = await fetchUsersFromContract();
        setUsers(userList);
    };

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "start" }} >
                    <img src="/logo.png" alt="Logo" width={80} height={80} />
                    <Typography
                        variant="h5"
                        component="h1"
                        color="#06d7d8"
                        fontFamily="cursive"
                    >
                        Task Management DApp
                    </Typography>
                </div>
                <Button variant="outlined" onClick={() => navigate("/")} color="#193344"
                    sx={{ color: "#0f444d", fontWeight: "bold" }}>
                    Back to Home
                </Button>
            </div>
            <div>
                <List>
                    {users.map((user, index) => (
                        <ListItem key={index} sx={{ maxWidth: "600px", borderBottom: "1px solid #ddd", margin: "auto" }}>
                            <ListItemText
                                primary={
                                    <Typography variant="body1" component="span" sx={{ color: "#ffffff", fontSize: "14px" }}>
                                        {index + 1}. {user}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </div>
        </>
    );
};

export default UsersList;
