const express = require("express");
const { createUrl, getUrlStats, redirectUrl } = require("../controller/Url");


const router = express.Router();

router.post("/shorturls", createUrl);           
router.get("/:shortCode", getUrlStats);  
router.get("/shorturls/:shortCode", redirectUrl); 

module.exports = router;
