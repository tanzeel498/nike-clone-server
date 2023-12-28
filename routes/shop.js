const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/products", shopController.getProducts);
router.get("/products/:id", shopController.getProduct);
router.get("/product-colors/:id", shopController.getProductColors);
module.exports = router;
