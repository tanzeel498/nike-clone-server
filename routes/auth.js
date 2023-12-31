const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.post("/checkUser", authController.postCheckUser);

module.exports = router;
