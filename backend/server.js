const express = require("express");
const cors = require("cors");

const donationRoutes = require("./routes/donationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", donationRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});