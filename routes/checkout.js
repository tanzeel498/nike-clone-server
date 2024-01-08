const express = require("express");

const checkoutController = require("../controllers/checkout");

const router = express.Router();

router.get("/address", checkoutController.getAddress);
router.post("/address", checkoutController.postAddress);
router.get("/payment", checkoutController.getPayment);
router.post("/payment", checkoutController.postPayment);

module.exports = router;
