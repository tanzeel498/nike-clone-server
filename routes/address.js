const express = require("express");

const addressController = require("../controllers/address");

const router = express.Router();

router.get("/address", addressController.getAddress);
router.post("/address", addressController.postAddress);

module.exports = router;
