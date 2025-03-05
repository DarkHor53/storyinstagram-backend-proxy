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
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer", // Keep this for binary data support
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:110.0) Gecko/20100101 Firefox/110.0", // Some sites require this header
        "Referer": "https://insta-stories-viewer.com/"
      }
    });

    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);

  } catch (error) {
    console.error("Error fetching file:", error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      
      // Convert response data to a readable format
      let responseData;
      try {
        responseData = error.response.data.toString("utf8"); // Convert buffer to string
      } catch (conversionError) {
        responseData = "[Failed to decode response]";
      }

      console.error("Response data:", responseData);
      res.status(error.response.status).send(responseData || "Unknown error from remote site.");
    } else {
      console.error("No response received.");
      res.status(500).send("No response received from the remote server.");
    }
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
