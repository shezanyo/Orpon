import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <button onClick={() => navigate("/create-campaign")}>
                Create Campaign
            </button>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;