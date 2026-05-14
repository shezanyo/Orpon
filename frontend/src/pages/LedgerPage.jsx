import React, { useEffect, useState } from "react";
import axios from "axios";

const LedgerPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/transactions"
            );

            setTransactions(response.data.transactions);
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    if (loading) {
        return <h2>Loading Public Ledger...</h2>;
    }

    return (
        <div className="ledger-container">
            <h1>Public Donation Ledger</h1>

            <table className="ledger-table">
                <thead>
                    <tr>
                        <th>Donor</th>
                        <th>Privacy</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Previous Hash</th>
                        <th>Current Hash</th>
                    </tr>
                </thead>

                <tbody>
                    {transactions.map((item) => (
                        <tr key={item.id}>
                            <td>{item.display_name}</td>
                            <td>{item.privacy_type}</td>
                            <td>৳ {item.amount}</td>
                            <td>
                                {new Date(
                                    item.created_at
                                ).toLocaleString()}
                            </td>
                            <td>{item.previous_hash}</td>
                            <td>{item.current_hash}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LedgerPage;