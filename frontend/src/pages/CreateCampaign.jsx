import React, { useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

const CreateCampaign = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        target_amount: ""
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
            const res = await axios.post(
                "http://localhost:5000/api/campaign/create",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            setMsg(`✅ Campaign Created: ${res.data.campaign_url}`);

        } catch (err) {
            setMsg("❌ Failed to create campaign");
        }
    };

    return (
        <div>
            <h2>Create Campaign</h2>

            <form onSubmit={handleSubmit}>
                <input
                    name="title"
                    placeholder="Title"
                    onChange={handleChange}
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="target_amount"
                    placeholder="Target Amount"
                    onChange={handleChange}
                />

                <button>Create</button>
            </form>

            <p>{msg}</p>
        </div>
    );
};

export default CreateCampaign;