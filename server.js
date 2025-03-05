const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Convert cookies into a properly formatted cookie string
const cookies = [
    { name: "_ym_d", value: "1741073059" },
    { name: "_ym_uid", value: "1741073059932255975" },
    { name: "_ym_isad", value: "1" }
].map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

// Proxy route
app.get("/proxy", async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) {
        return res.status(400).send("Missing 'url' query parameter");
    }

    try {
        const response = await axios.get(fileUrl, {
            responseType: "arraybuffer", // Ensures binary data support
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Referer": "https://iqsaved.com/", // The site that works
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Ch-Ua": `"Not A(Brand";v="99", "Google Chrome";v="113", "Chromium";v="113"`,
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": `"Windows"`,
                "Sec-Fetch-Dest": "image",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Cookie": cookies // Use the working cookies
            }
        });

        // Pass the correct content type to the frontend
        res.set("Content-Type", response.headers["content-type"]);
        res.send(response.data);

    } catch (error) {
        console.error("Error fetching file:", error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            let responseData;
            try {
                responseData = error.response.data.toString("utf8"); // Convert buffer to readable text
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
