const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variable
const COC_API_KEY = process.env.COC_API_KEY;

// -------------------
// Health check
// -------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    apiKeyConfigured: Boolean(COC_API_KEY)
  });
});

// -------------------
// Current war endpoint
// -------------------
app.get("/current-war/:clanTag", async (req, res) => {
  if (!COC_API_KEY) {
    return res.status(500).json({
      error: "API key not configured"
    });
  }

  // Clean clan tag (remove # if user includes it)
  const clanTag = req.params.clanTag.replace("#", "").toUpperCase();

  try {
    const response = await axios.get(
      `https://api.clashofclans.com/v1/clans/%23${clanTag}/currentwar`,
      {
        headers: {
          Authorization: `Bearer ${COC_API_KEY}`,
          Accept: "application/json"
        },
        timeout: 10000
      }
    );

    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;

    res.status(status).json({
      error: "Failed to fetch war",
      details: err.response?.data || err.message
    });
  }
});

// -------------------
// IMPORTANT for Render
// -------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
