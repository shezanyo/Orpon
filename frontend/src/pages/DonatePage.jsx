import React, { useState } from "react";
import axios from "axios";

const DonatePage = () => {
    const [formData, setFormData] = useState({
        donor_name: "",
        amount: "",
        privacy_type: "public"
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:5000/api/donate",
                formData
            );

            setMessage("Donation Successful!");
            console.log(response.data);

            setFormData({
                donor_name: "",
                amount: "",
                privacy_type: "public"
            });

        } catch (error) {
            console.error(error);
            setMessage("Donation Failed");
        }
    };

    return (
        <div className="donation-container">
            <h1>Donation Form</h1>

            <form onSubmit={handleSubmit} className="donation-form">

                <input
                    type="text"
                    name="donor_name"
                    placeholder="Enter Your Name"
                    value={formData.donor_name}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Enter Donation Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                />

                <select
                    name="privacy_type"
                    value={formData.privacy_type}
                    onChange={handleChange}
                >
                    <option value="public">
                        Public Name
                    </option>

                    <option value="anonymous">
                        Anonymous
                    </option>

                    <option value="pseudonym">
                        Pseudonym
                    </option>
                </select>

                <button type="submit">
                    Donate Now
                </button>
            </form>

            {message && (
                <p className="message">
                    {message}
                </p>
            )}
        </div>
    );
};

export default DonatePage;