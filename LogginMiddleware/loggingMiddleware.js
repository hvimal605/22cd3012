
const axios = require("axios");

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";

async function Log(stack, level, packageName, message) {
  try {
    const payload = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message,
    };

    await axios.post(LOG_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log(" Log sent:", payload);
  } catch (error) {
    console.error(" Failed to send log:", error.message);
  }
}

module.exports = Log;
