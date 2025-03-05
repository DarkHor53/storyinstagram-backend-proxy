const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Convert the cookie list into a properly formatted string
const cookies = [
    "_ga=GA1.1.1940857685.1741073059",
    "_ym_uid=1741073059932255975",
    "_ym_d=1741073059",
    "_ym_isad=1",
    "_ga_RWNEPS7JVV=GS1.1.1741171258.4.1.1741171747.0.0.0"
].join("; ");

// Proxy route
app.get("/proxy", async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) {
        return res.status(400).send("Missing 'url' query parameter");
    }

    try {
        const response = await axios.get(fileUrl, {
            responseType: "arraybuffer", // Ensures binary data support for images
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
                "Cache-Control": "max-age=0",
                "If-Modified-Since": "Mon, 10 Feb 2025 20:24:41 GMT",
                "Priority": "u=0, i",
                "Sec-Ch-Ua": `"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"`,
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": `"Windows"`,
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "Referer": "https://iqsaved.com/",
                "Cookie": cookies // Authenticated session cookies
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
