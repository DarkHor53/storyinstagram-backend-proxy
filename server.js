const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Use PORT from environment (e.g., provided by Railway) or default to 3000
const PORT = process.env.PORT || 3000;

// Health-check route
app.get("/", (req, res) => {
  res.send("Proxy Server is up and running!");
});

// Proxy route
app.get("/proxy", async (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) {
    return res.status(400).send("Missing 'url' query parameter");
  }

  try {
    // Fetch the remote file using Axios
    // 1) We specify 'arraybuffer' because we might be fetching binary data (images, PDFs, etc.)
    // 2) We include a generic "User-Agent" header in case the remote server requires it
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    // Copy the Content-Type header from the remote server, so the file type is recognized correctly
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);

  } catch (error) {
    // Log a basic error message
    console.error("Error fetching file:", error.message);

    // If the remote server responded with an error, log the details
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    // Return the remote server's status code or fallback to 500
    const statusCode = error.response?.status || 500;
    // Return the remote server's error data or a generic message
    const errorData = error.response?.data || "Failed to fetch the file";

    res.status(statusCode).send(errorData);
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
