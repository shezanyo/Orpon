import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import DonatePage from "./pages/DonatePage";
import LedgerPage from "./pages/LedgerPage";

import { getToken } from "./utils/auth";

/*
-----------------------------------
Protected Route Component
-----------------------------------
*/
const ProtectedRoute = ({ children }) => {
    const token = getToken();

    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/ledger" element={<LedgerPage />} />

                {/* Campaign Donation */}
                <Route path="/campaign/:campaignId" element={<DonatePage />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-campaign"
                    element={
                        <ProtectedRoute>
                            <CreateCampaign />
                        </ProtectedRoute>
                    }
                />

                {/* Default Redirect */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;