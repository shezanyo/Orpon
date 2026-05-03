import React, { useState } from "react";
import axios from "axios";

const RegisterPage = () => {
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: ""
    });

    const [msg, setMsg] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "http://localhost:5000/api/register",
                form
            );

            setMsg("✅ Registered successfully. Now login.");

        } catch (err) {
            setMsg("❌ Registration failed");
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <input
                    name="full_name"
                    placeholder="Full Name"
                    onChange={handleChange}
                />

                <input
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                />

                <button>Register</button>
            </form>

            <p>{msg}</p>
        </div>
    );
};

export default RegisterPage;