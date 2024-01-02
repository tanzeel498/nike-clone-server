const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/getUser", authController.getUser);
router.post("/checkUser", authController.postCheckUser);
router.post("/verifyOtp", authController.verifyOtp);
router.post("/signUp", authController.postSignUp);
router.post("/login", authController.postLogin);
router.get("/logout", authController.getLogout);

module.exports = router;
