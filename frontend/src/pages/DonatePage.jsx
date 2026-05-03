import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const DonatePage = () => {
    const { campaignId } = useParams();

    const [formData, setFormData] = useState({
        donor_name: "",
        amount: "",
        privacy_type: "public"
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ VALIDATION
        if (!campaignId) {
            setMessage("❌ Invalid campaign link");
            return;
        }

        if (!formData.amount || formData.amount <= 0) {
            setMessage("❌ Enter a valid amount");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post(
                "http://localhost:5000/api/donate",
                {
                    ...formData,
                    amount: Number(formData.amount),
                    campaign_id: campaignId
                }
            );

            setMessage("✅ Donation Successful!");

            // reset
            setFormData({
                donor_name: "",
                amount: "",
                privacy_type: "public"
            });

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "❌ Donation Failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="donation-container">
            <h1>Donate to Campaign</h1>

            {/* Optional debug / info */}
            <p style={{ fontSize: "12px", color: "gray" }}>
                Campaign ID: {campaignId}
            </p>

            <form onSubmit={handleSubmit} className="donation-form">

                <input
                    type="text"
                    name="donor_name"
                    placeholder="Your Name (optional)"
                    value={formData.donor_name}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Donation Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="1"
                    required
                />

                <select
                    name="privacy_type"
                    value={formData.privacy_type}
                    onChange={handleChange}
                >
                    <option value="public">Public Name</option>
                    <option value="anonymous">Anonymous</option>
                    <option value="pseudonym">Pseudonym</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Donate Now"}
                </button>
            </form>

            {message && (
                <p
                    className="message"
                    style={{
                        color: message.includes("❌")
                            ? "red"
                            : "green"
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
};

export default DonatePage;