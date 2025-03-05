const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Use an environment variable for the port so Railway can set it dynamically
const PORT = process.env.PORT || 3000;

// Simple health-check route
app.get("/", (req, res) => {
  res.send("Proxy Server is up and running!");
});

// Our proxy route
app.get("/proxy", async (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) {
    return res.status(400).send("Missing 'url' query parameter");
  }

  try {
    // Fetch the file using Axios
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    // Copy the content-type from the remote server
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching file:", error.message);
    res.status(500).send("Failed to fetch the file");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
