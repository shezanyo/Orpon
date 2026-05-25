require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const campaignRoutes =
require("./routes/campaignRoutes");
const donationRoutes =
require("./routes/donationRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);
app.use("/api", campaignRoutes);
app.use("/api", donationRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});