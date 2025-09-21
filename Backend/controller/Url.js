const { nanoid } = require("nanoid");
const Url = require("../model/Url");
const Log = require("../../LogginMiddleware/loggingMiddleware"); 

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// POST /shorturls
exports.createUrl = async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url) {
      await Log("backend", "error", "handler", "URL is required but not provided");
      return res.status(400).json({ message: "URL is required" });
    }

    const existing = await Url.findOne({ longUrl: url });
    if (existing) {
      await Log("backend", "info", "db", "URL already shortened");
      return res.status(200).json({
        shortLink: `${BASE_URL}/${existing.shortCode}`,
        expiry: existing.expiresAt,
        message: "URL already shortened",
      });
    }

    let shortCode = shortcode || nanoid(6);
    const expiresAt = new Date(Date.now() + (validity || 30) * 60000);

    const newUrl = await Url.create({
      longUrl: url,
      shortCode,
      expiresAt,
    });

    await Log("backend", "info", "db", `New short URL created: ${shortCode}`);

    return res.status(201).json({
      shortLink: `${BASE_URL}/${shortCode}`,
      expiry: expiresAt.toISOString(),
    });

  } catch (error) {
    await Log("backend", "fatal", "db", `Error in createUrl: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// GET /shorturls/:shortCode
exports.getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlData = await Url.findOne({ shortCode });

    if (!urlData) {
      await Log("backend", "error", "db", `Short URL not found: ${shortCode}`);
      return res.status(404).json({ message: "Short URL not found" });
    }

    await Log("backend", "info", "db", `Fetched stats for shortCode: ${shortCode}`);

    return res.json({
      longUrl: urlData.longUrl,
      shortCode: urlData.shortCode,
      clicks: urlData.clicks,
      createdAt: urlData.createdAt,
      expiry: urlData.expiresAt,
    });
  } catch (error) {
    await Log("backend", "fatal", "db", `Error in getUrlStats: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Redirect handler
exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const foundUrl = await Url.findOne({ shortCode });

    if (!foundUrl) {
      await Log("backend", "error", "db", `Redirect failed - URL not found: ${shortCode}`);
      return res.status(404).json({ message: "URL Not Found" });
    }

    if (foundUrl.expiresAt && foundUrl.expiresAt < Date.now()) {
      await Log("backend", "error", "db", `Redirect failed - URL expired: ${shortCode}`);
      return res.status(410).json({ error: "URL expired" });
    }

    foundUrl.clicks++;
    await foundUrl.save();

    await Log("backend", "info", "handler", `Redirected shortCode: ${shortCode}`);

    return res.redirect(foundUrl.longUrl);
  } catch (error) {
    await Log("backend", "fatal", "handler", `Redirect error: ${error.message}`);
    return res.status(500).json({ error: "Server error" });
  }
};
